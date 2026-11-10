#!/usr/bin/env python3
"""
qa_trailer.py — automated technical QA for a game trailer / cinematic,
plus DENSE frame extraction so Claude can watch the video frame by frame.

It only CHECKS and REPORTS. It never modifies the input video.

Usage:
    python3 qa_trailer.py trailer.mp4 [--out qa_out] [--fps 4] [--profile steam|generic]

Outputs (in --out):
    report.md      human-readable report (pass/warn/fail + timestamps)
    report.json    same data, machine-readable
    frames/        dense frames f_000012.34s.jpg  (every 1/fps seconds, 960px wide)
                   plus c_<time>s.jpg for the first frame after every detected cut
    frames/index.txt  one line per frame: filename, timestamp, shot number

Requires: ffmpeg, ffprobe, python3 with opencv-python (cv2) and numpy.
"""
import argparse, json, os, re, shutil, subprocess, sys
from pathlib import Path

try:
    import cv2, numpy as np
except ImportError:
    sys.exit("Missing deps: pip install opencv-python-headless numpy  (--break-system-packages if needed)")


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def ts(sec):
    m, s = divmod(sec, 60)
    return f"{int(m):02d}:{s:05.2f}"


# ---------------------------------------------------------------- probe
def probe(path):
    r = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path])
    if r.returncode != 0:
        sys.exit("ffprobe failed: " + r.stderr)
    d = json.loads(r.stdout)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
    if v is None:
        sys.exit("No video stream found")
    num, den = v.get("avg_frame_rate", "0/1").split("/")
    fps = float(num) / float(den) if float(den) else 0
    info = {
        "video_codec": v.get("codec_name"),
        "width": int(v.get("width", 0)),
        "height": int(v.get("height", 0)),
        "fps": round(fps, 3),
        "duration_s": round(float(d["format"].get("duration", 0)), 2),
        "bitrate_kbps": round(int(d["format"].get("bit_rate", 0)) / 1000),
        "audio_codec": a.get("codec_name") if a else None,
        "audio_channels": int(a.get("channels", 0)) if a else 0,
        "audio_sample_rate": int(a.get("sample_rate", 0)) if a else 0,
        "pix_fmt": v.get("pix_fmt"),
    }
    return info


# ---------------------------------------------------------------- spec checks
def spec_checks(info, profile):
    issues = []  # (level, text)
    def add(level, text): issues.append({"level": level, "at": None, "msg": text})

    if info["video_codec"] != "h264":
        add("fail" if profile == "steam" else "warn",
            f"Video codec is {info['video_codec']} — Steam wants H.264 (libx264).")
    if info["audio_codec"] is None:
        add("warn", "No audio track at all.")
    elif info["audio_codec"] != "aac":
        add("warn", f"Audio codec is {info['audio_codec']} — Steam wants AAC.")
    if info["height"] > 1080 or info["width"] > 1920:
        add("warn", f"Resolution {info['width']}x{info['height']} is above 1080p — Steam max is 1920x1080.")
    if info["height"] < 720:
        add("warn", f"Resolution {info['width']}x{info['height']} is low (below 720p).")
    if abs(info["width"] / max(info["height"], 1) - 16 / 9) > 0.02:
        add("warn", f"Aspect ratio is not 16:9 ({info['width']}x{info['height']}).")
    if round(info["fps"]) not in (24, 25, 30, 50, 60):
        add("warn", f"Unusual frame rate {info['fps']} fps.")
    if info["fps"] < 23.9:
        add("fail", f"Frame rate {info['fps']} fps is below 24 — will look choppy.")
    if profile == "steam" and info["bitrate_kbps"] < 5000:
        add("warn", f"Bitrate {info['bitrate_kbps']} kbps is below Steam's recommended 5000+ kbps.")
    if info["duration_s"] < 25:
        add("warn", f"Duration {info['duration_s']}s is short — Steam trailers usually run 30–90 s.")
    if info["duration_s"] > 120:
        add("warn", f"Duration {info['duration_s']}s is long — Steam trailers usually run 30–90 s.")
    if info["pix_fmt"] not in (None, "yuv420p"):
        add("warn", f"Pixel format {info['pix_fmt']} — use yuv420p for maximum player compatibility.")
    return issues


# ---------------------------------------------------------------- audio
def audio_checks(path, duration):
    issues, stats = [], {}
    # silence
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af",
             "silencedetect=noise=-45dB:d=1.0", "-f", "null", "-"])
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    silences = []
    for i, s in enumerate(starts):
        e = ends[i] if i < len(ends) else duration
        silences.append((s, e))
        # ignore trailing silence < 2 s (fade out) and leading < 1 s
        if e >= duration - 0.1 and (e - s) < 2.0:
            continue
        if s <= 0.05 and (e - s) < 1.0:
            continue
        issues.append({"level": "warn", "at": s,
                       "msg": f"Audio silence for {e - s:.1f}s ({ts(s)}–{ts(e)})."})
    stats["silences"] = silences
    # loudness
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"])
    ms = re.findall(r"I:\s+([-\d.]+) LUFS", r.stderr)
    ps = re.findall(r"Peak:\s+([-\d.]+) dBFS", r.stderr)
    m = ms[-1] if ms else None
    p = ps[-1] if ps else None
    if m:
        lufs = float(m); stats["integrated_lufs"] = lufs
        if lufs < -24: issues.append({"level": "warn", "at": None, "msg": f"Overall loudness {lufs} LUFS is quiet (aim around -14 to -16 LUFS for web/Steam)."})
        if lufs > -9: issues.append({"level": "warn", "at": None, "msg": f"Overall loudness {lufs} LUFS is very hot — risk of distortion."})
    if p:
        peak = float(p); stats["true_peak_dbfs"] = peak
        if peak > -0.5: issues.append({"level": "warn", "at": None, "msg": f"True peak {peak} dBFS — clipping risk, keep peaks at or below -1 dBFS."})
    return issues, stats


# ---------------------------------------------------------------- video scan
def video_scan(path, info, out_dir, extract_fps):
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        sys.exit("OpenCV could not open the video")
    fps = info["fps"] or cap.get(cv2.CAP_PROP_FPS) or 30
    n_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frames_dir = Path(out_dir) / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    lumas, diffs, moved_frac, magenta_hits = [], [], [], []
    prev_small = None
    extract_every = max(1, int(round(fps / extract_fps)))
    saved = []  # (filename, t, kind)
    cuts = []
    shot = 1
    i = 0
    CUT_T = 38.0  # mean abs diff on 160x90 grayscale → scene cut
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        t = i / fps
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        small = cv2.resize(gray, (160, 90), interpolation=cv2.INTER_AREA).astype(np.float32)
        luma = float(small.mean())
        lumas.append(luma)
        d = float(np.abs(small - prev_small).mean()) if prev_small is not None else 0.0
        diffs.append(d)
        moved = float((np.abs(small - prev_small) > 6).mean()) if prev_small is not None else 1.0
        moved_frac.append(moved)
        is_cut = prev_small is not None and (d > CUT_T or (moved > 0.45 and d > 6))
        # missing-texture magenta check (every 5th frame to stay fast)
        if i % 5 == 0:
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            hh, ss, vv = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]
            mag = float(((hh >= 142) & (hh <= 158) & (ss > 170) & (vv > 90)).mean())
            if mag > 0.004:
                magenta_hits.append(t)
        if is_cut:
            cuts.append(t); shot += 1
        if i % extract_every == 0 or is_cut:
            kind = "c" if is_cut else "f"
            name = f"{kind}_{t:07.2f}s.jpg"
            h, w = frame.shape[:2]
            scale = 960 / w if w > 960 else 1.0
            img = cv2.resize(frame, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA) if scale < 1 else frame
            cv2.imwrite(str(frames_dir / name), img, [cv2.IMWRITE_JPEG_QUALITY, 88])
            saved.append((name, t, shot))
        prev_small = small
        i += 1
    cap.release()
    n = len(lumas)
    issues = []

    # black / very dark stretches
    dark = [l < 20 for l in lumas]
    _runs(dark, fps, 0.5, issues, "warn", "Black / near-black frames for {dur:.1f}s", skip_head_tail=1.0, n=n)
    # freezes (identical frames)
    frozen = [mv < 0.0005 and not dk for mv, dk in zip(moved_frac, dark)]
    frozen[0] = False
    _runs(frozen, fps, 1.5, issues, "warn", "Frozen (identical) frames for {dur:.1f}s — stuck render or still image?", skip_head_tail=0.0, n=n)
    # flashes: luma jumps up and back within 4 frames
    for k in range(1, n - 4):
        if lumas[k] - lumas[k - 1] > 60 and (lumas[k] - min(lumas[k + 1:k + 5])) > 60:
            issues.append({"level": "warn", "at": k / fps, "msg": f"Bright flash at {ts(k / fps)} (luma spike {lumas[k - 1]:.0f}→{lumas[k]:.0f}). Check it is intentional."})
    # sudden localized change (pop-in / teleport / object snapping) — spike in moved pixels without a cut
    cut_frames = set(int(round(c * fps)) for c in cuts)
    mv = np.array(moved_frac)
    for k in range(8, n - 8):
        if k in cut_frames or any(abs(k - c) <= 2 for c in cut_frames):
            continue
        neigh = np.concatenate([mv[k - 8:k - 1], mv[k + 2:k + 9]])
        base = float(np.median(neigh)) + 0.0015
        if mv[k] > 0.005 and mv[k] > 3 * base and diffs[k] <= CUT_T:
            issues.append({"level": "warn", "at": k / fps, "msg": f"Sudden change inside a shot at {ts(k / fps)} with no cut — object pop-in, teleport or snapping animation? ({mv[k]*100:.1f}% of pixels changed vs ~{base*100:.1f}% around it)."})
    # magenta / missing texture
    if magenta_hits:
        runs = [[magenta_hits[0], magenta_hits[0]]]
        for t0 in magenta_hits[1:]:
            if t0 - runs[-1][1] < 0.5: runs[-1][1] = t0
            else: runs.append([t0, t0])
        for a, b in runs:
            issues.append({"level": "warn", "at": a, "msg": f"Saturated magenta surface {ts(a)}–{ts(b)} — classic missing-texture colour; confirm it is not an intentional pink/neon material."})
    # dedupe flashes within 0.3 s
    issues = _dedupe(issues, 1.5 / fps)
    # first frame black?
    if lumas and lumas[0] < 20:
        issues.append({"level": "info", "at": 0.0, "msg": "Frame 0 is black — Steam's thumbnail and auto micro-trailer may start on black."})
    # cut rhythm
    if cuts:
        gaps = np.diff([0.0] + cuts + [info["duration_s"]])
        too_fast = [(cuts[j], gaps[j + 1]) for j in range(len(cuts)) if gaps[j + 1] < 0.25]
        for t0, g in too_fast[:10]:
            issues.append({"level": "info", "at": t0, "msg": f"Shot shorter than 0.25s at {ts(t0)} ({g:.2f}s) — may be a flicker/double cut."})
    first_cut = cuts[0] if cuts else None
    stats = {
        "frames_total": n, "cuts": [round(c, 2) for c in cuts], "shots": shot,
        "first_cut_s": round(first_cut, 2) if first_cut else None,
        "avg_shot_s": round(info["duration_s"] / max(shot, 1), 2),
        "frames_extracted": len(saved),
    }
    with open(frames_dir / "index.txt", "w") as f:
        for name, t, sh in saved:
            f.write(f"{name}\t{t:.2f}\tshot{sh}\n")
    return issues, stats, saved


def _runs(flags, fps, min_s, issues, level, msg, skip_head_tail, n):
    k = 0
    while k < len(flags):
        if flags[k]:
            j = k
            while j < len(flags) and flags[j]:
                j += 1
            dur = (j - k) / fps
            t0 = k / fps
            at_edge = t0 < skip_head_tail or (n - j) / fps < skip_head_tail
            if dur >= min_s and not at_edge:
                issues.append({"level": level, "at": t0, "msg": msg.format(dur=dur) + f" ({ts(t0)}–{ts(j / fps)})."})
            k = j
        else:
            k += 1


def _dedupe(issues, window):
    out = []
    for it in issues:
        if it["at"] is not None and out and out[-1]["at"] is not None and it["msg"][:12] == out[-1]["msg"][:12] and abs(it["at"] - out[-1]["at"]) < window:
            continue
        out.append(it)
    return out


# ---------------------------------------------------------------- contact-zone crops
def contact_crops(out_dir, saved, min_frames=4):
    """For each shot, model the static background (median of its frames), find moving
    objects in every frame, and save an enlarged crop around each one — where it touches
    the floor, walls, props. These are the spots where clipping / floating / sinking hide.
    Shots with a moving camera (most of the frame changes) are skipped and listed."""
    fdir = Path(out_dir) / "frames"; cdir = Path(out_dir) / "crops"; cdir.mkdir(exist_ok=True)
    by_shot = {}
    for name, t, sh in saved:
        by_shot.setdefault(sh, []).append((name, t))
    made, skipped = [], []
    for sh, items in by_shot.items():
        if len(items) < min_frames:
            skipped.append((sh, "too short")); continue
        imgs = [cv2.imread(str(fdir / n)) for n, _ in items]
        bg = np.median(np.stack(imgs), axis=0).astype(np.uint8)
        moving_cam = 0
        for (name, t), img in zip(items, imgs):
            diff = cv2.absdiff(img, bg).max(axis=2)
            mask = (diff > 28).astype(np.uint8) * 255
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
            mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
            if mask.mean() / 255 > 0.40:
                moving_cam += 1; continue
            nlab, lab, stats, _ = cv2.connectedComponentsWithStats(mask)
            h, w = img.shape[:2]
            for k in range(1, nlab):
                x, y, bw, bh, area = stats[k]
                if area < 0.002 * w * h: continue
                pad_x, pad_y = int(bw * 0.45) + 12, int(bh * 0.35) + 12
                x0, y0 = max(0, x - pad_x), max(0, y - pad_y); x1, y1 = min(w, x + bw + pad_x), min(h, y + bh + 2 * pad_y)  # extra room below = floor contact
                crop = img[y0:y1, x0:x1]
                blob = img[y:y + bh, x:x + bw]
                hsv_b = cv2.cvtColor(blob, cv2.COLOR_BGR2HSV)
                if hsv_b[:, :, 2].mean() < 70 and hsv_b[:, :, 1].mean() < 60:
                    continue  # only a moving shadow — skip
                sc = max(1.0, 420 / max(crop.shape[:2]))
                crop = cv2.resize(crop, (int(crop.shape[1] * sc), int(crop.shape[0] * sc)), interpolation=cv2.INTER_CUBIC)
                cn = f"z_{t:07.2f}s_shot{sh}_{k}.jpg"; cv2.imwrite(str(cdir / cn), crop, [cv2.IMWRITE_JPEG_QUALITY, 90]); made.append(cn)
        if moving_cam > len(items) / 2:
            skipped.append((sh, "moving camera — review full frames carefully"))
    with open(cdir / "index.txt", "w") as f:
        for c in sorted(made): f.write(c + "\n")
        for sh, why in skipped: f.write(f"# shot{sh} skipped: {why}\n")
    return len(made), skipped


# ---------------------------------------------------------------- report
def write_report(out_dir, path, info, issues, stats, profile):
    levels = [i["level"] for i in issues]
    gate = "fail" if "fail" in levels else ("warn" if "warn" in levels else "pass")
    issues_sorted = sorted(issues, key=lambda i: (i["at"] is None, i["at"] or 0))
    data = {"gate": gate, "video": str(path), "profile": profile, "metrics": info, "stats": stats, "issues": issues_sorted}
    (Path(out_dir) / "report.json").write_text(json.dumps(data, indent=2))
    L = [f"# Trailer QA — technical pass", f"- video: `{path}`", f"- gate: **{gate.upper()}**", "",
         "## Metrics",
         f"- {info['width']}x{info['height']} @ {info['fps']} fps, {info['duration_s']} s, {info['bitrate_kbps']} kbps",
         f"- video: {info['video_codec']} ({info['pix_fmt']}), audio: {info['audio_codec']} {info['audio_channels']}ch {info['audio_sample_rate']} Hz",
         f"- shots: {stats['shots']} (first cut at {stats['first_cut_s']} s, avg shot {stats['avg_shot_s']} s)",
         f"- loudness: {stats.get('integrated_lufs', 'n/a')} LUFS, true peak {stats.get('true_peak_dbfs', 'n/a')} dBFS",
         f"- frames extracted for visual review: {stats['frames_extracted']} (see frames/index.txt)",
         f"- contact-zone crops (enlarged, around every moving object): {stats.get('contact_crops', 0)} (see crops/index.txt)"
         + (f"; skipped: {', '.join(stats['crops_skipped_shots'])}" if stats.get('crops_skipped_shots') else ""), "",
         "## Findings"]
    if not issues_sorted:
        L.append("- none from the automated checks")
    for it in issues_sorted:
        where = f"[{ts(it['at'])}] " if it["at"] is not None else ""
        L.append(f"- **{it['level'].upper()}** {where}{it['msg']}")
    L += ["", "## Next step", "The LOGIC review (floating objects, clipping, HUD overlap, broken props) is NOT automated —",
          "Claude must now look at EVERY frame in frames/ in order and report what it sees."]
    (Path(out_dir) / "report.md").write_text("\n".join(L))
    return gate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--out", default="qa_out")
    ap.add_argument("--fps", type=float, default=4.0, help="frames per second to extract for the visual review (default 4)")
    ap.add_argument("--profile", choices=["steam", "generic"], default="steam")
    a = ap.parse_args()
    if not Path(a.video).exists():
        sys.exit(f"File not found: {a.video}")
    if Path(a.out).exists():
        shutil.rmtree(a.out)
    Path(a.out).mkdir(parents=True)
    info = probe(a.video)
    issues = spec_checks(info, a.profile)
    ai, astats = audio_checks(a.video, info["duration_s"])
    vi, vstats, saved = video_scan(a.video, info, a.out, a.fps)
    ncrops, skipped = contact_crops(a.out, saved)
    vstats["contact_crops"] = ncrops
    vstats["crops_skipped_shots"] = [f"shot{s}: {w}" for s, w in skipped]
    stats = {**vstats, **astats}
    stats.pop("silences", None)
    gate = write_report(a.out, a.video, info, issues + ai + vi, stats, a.profile)
    print(open(Path(a.out) / "report.md").read())
    print(f"\n[gate={gate}] frames in {a.out}/frames — now review them one by one.")


if __name__ == "__main__":
    main()
