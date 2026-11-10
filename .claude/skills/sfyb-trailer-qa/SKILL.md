---
name: sfyb-trailer-qa
description: Frame-by-frame QA for Mesika's game trailers, cinematics and gameplay videos (Steal From Your Boss / BIG BUN, Escape Office, Storm Royale, Football, or any game video). Checks the file technically against Steam's trailer rules (ffprobe/ffmpeg — codec, resolution, fps, bitrate, duration, black frames, freezes, flashes, silence, loudness, cut detection), then extracts DENSE frames and makes Claude actually look at every one of them for logic bugs — floating objects, characters clipping through walls or props, things breaking or collapsing, missing textures, HUD overlaps, debug text, unreadable titles. REPORT ONLY — it never edits the video. Use whenever Mesika uploads or points at an mp4/mov/webm trailer or cinematic and asks to check it, review it, see if it came out well, "תבדוק את הטריילר", "תראה אם הכל הגיוני", "יש באגים בסרטון?", before uploading a trailer to Steam, or after Claude itself renders any video for him.
---

# SFYB Trailer QA

Two passes, in this order. The second pass is the one Mesika cares about: he has caught clipping that was missed when frames were sampled sparsely. **Dense frames, every frame looked at, nothing skipped.**

**Rule 0 — look, don't touch.** This skill checks and reports. Never re-encode, trim, re-render or "fix" the video, and never offer the fix before the report. Mesika edits in After Effects and will fix it himself from the timestamps.

## Pass 1 — technical (automated)

```bash
python3 scripts/qa_trailer.py <video> --out qa_out --fps 4 --profile steam
```

- `--fps 4` = one frame every 0.25 s. This is the minimum. For a short cinematic (< 40 s), or if Mesika says something specific looked wrong, use `--fps 8` or higher. Never go below 4.
- `--profile generic` for videos that are not going to Steam (YouTube/TikTok cuts, in-game cinematics).
- If cv2 is missing: `pip install opencv-python-headless numpy --break-system-packages`.

The script prints `qa_out/report.md` (gate pass/warn/fail, metrics, timestamped findings: spec vs Steam, black frames, freezes, flashes, silence/loudness, magenta missing-texture surfaces, and *sudden change inside a shot* = pop-in / teleport / snapping — go look at that exact timestamp) and writes `qa_out/frames/` plus `frames/index.txt` (filename, timestamp, shot number). Frames named `c_…` are the first frame after a detected cut — a new shot starts there.

Read the report. Do not stop here; the automated pass only finds technical problems.

## Pass 2 — logic (manual, every frame)

Review aids the script makes: `frames/` (every frame, full size) and `crops/` — enlarged crops around every moving object with extra room below it, i.e. the contact zones (feet/wheels on the floor, a body against a wall, a car next to a pillar). View the crops for each moment too; clipping that is 6 px wide in the frame is obvious at 3x. Crops are skipped for shots with a moving camera (listed in `crops/index.txt`) — review those full frames extra carefully.

1. Read `references/logic-checklist.md` once.
2. `cat qa_out/frames/index.txt` to know how many frames there are and where the shots start.
3. View the frames **in order, all of them**, with the `view` tool. Batch them several per turn if you like, but do not sample, do not skip ahead, do not use contact sheets as a substitute — small thumbnails hide a foot through a floor. If there are 300 frames, view 300 frames.
4. For every frame ask: is anything floating with nothing under it? Is anything passing through anything? Did anything break, collapse, stretch, pop in, lose its texture? Does the shot make sense (who, where, why)? HUD/debug text/overlaps? Readable title?
5. Compare each frame with the previous one of the same shot: objects that move with no motion between frames, lighting that changes with no cut, characters that teleport.
6. Keep a running list as you go: `timestamp — shot N — what is wrong — severity`. Do not wait until the end to write it down.
7. Through vs behind — the mutual-occlusion rule. If object A covers part of object B AND B covers part of A in the same frame, they are inside each other: clipping (a pillar drawn over the car's roof while the car's body is drawn over the pillar's base; a body drawn over a wall's face with the other half missing). If one object consistently covers the other, it is just behind — legitimate. Also: a body cut by a straight line in the middle of a surface (not at its edge) is entering that surface.
   Floating vs jumping — floating = gap between contact point and shadow that persists; a jump is a short arc (rise and land within about 1 s) across consecutive frames. Sinking = an object's bottom edge stays flat at floor level while its height shrinks.
   Holes — sky colour visible below the horizon / through the floor is a missing floor, not a rug.
   Foot sliding — a character moving across the floor with legs that never change pose between frames: no walk cycle.
   A single frame often cannot tell *in front of* from *inside*: a character overlapping a counter, feet at floor level. Decide from the shadow/contact point and from the frames before and after (does the body slide across the prop's face? does the shadow sit on the far side?). If still unclear, report it as לבדיקה with the reason.
8. When something is suspicious at 4 fps (a limb that may be inside a counter, a prop that may be floating), re-extract that moment densely to confirm or clear it:
   ```bash
   ffmpeg -ss <t-0.5> -t 1 -i <video> -vf fps=24,scale=960:-1 qa_out/zoom_<t>_%03d.jpg
   ```
   and view those too. Report the confirmed result, not the suspicion.

## Severity

- **באג** — physically impossible or visibly broken: floating, clipping, collapse, missing texture, debug text, HUD overlap, title cut off. Must fix before publishing.
- **לבדיקה** — looks odd but could be intentional (cartoon exaggeration, stylised geometry, a very fast cut). Say what you saw and why you are unsure.
- **הערה** — not a bug, would make the trailer better (first 5 s has no gameplay, title too small, long silence).

## Report (in Hebrew, this exact shape)

```
## QA לטריילר: <שם הקובץ>
סטטוס: ✅ נקי / ⚠️ יש הערות / ❌ יש באגים
נבדקו: <N> פריימים, <M> שוטים, <duration> שניות, כל <1/fps> שנייה

### טכני (Steam)
<metrics line + each automated finding with timestamp, or "תקין">

### באגים (חובה לתקן)
1. 00:12.25 — שוט 4 — הבוס מרחף ~20 ס"מ מעל הרצפה, הצל לא נוגע ברגליים.
2. 00:31.50 — שוט 9 — יד שמאל של השחקן עוברת דרך הדלפק.

### לבדיקה
1. 00:07.00 — שוט 2 — המגש מוטה 45° בלי שמישהו מחזיק אותו — אולי רגע אחרי זריקה?

### הערות
...

### מה כן טוב
<2–3 lines — what works, so he knows what not to touch>
```

Every item has a timestamp, a shot number and a concrete description of what is wrong in physical terms. "Something looks off" is not a finding. If a category is empty, write "אין".

End the report there. No fix proposals unless Mesika asks.

## Trailer-specific rules (from the Steam launch skill)

- Gameplay must appear in the first 5 seconds; Steam cuts a 6 s micro-trailer from the start and autoplays muted.
- 30–90 s, H.264 + AAC, ≤ 1080p, 30 or 60 fps, 5000+ kbps, ends on the title.
- No Electron frame, cursor, taskbar, console, FPS counter, version label or REPORT A BUG button in a trailer.
