---
name: "sfyb-game-engineering"
description: "Use for any code, audio, voice, NPC, multiplayer or QA work on Mesika's game Steal From Your Boss — how the minified codebase is patched safely, the voice pipeline (Kokoro), audio buses, Playwright testing, and the honesty/backup rules."
---

# Steal From Your Boss — engineering playbook

The game: first-person co-op heist in the BIG BUN restaurant (three.js client + Node server, shipped as a WebView2 launcher `StealFromYourBoss.exe` for Steam). Players work a shift, steal from the boss Gary, talk to NPC customers in English (speech-to-text + canned voiced replies). Goal: a viral Steam game people buy with friends. Next level planned: THE BANK.

## Mesika's standing rules (non-negotiable)
- Every 3D thing is built in Blender (see skill `sfyb-blender-modeling`). Cartoon style, never GTA-realistic.
- **Every new character gets a voice that does not sound AI and speaks fluently like the others** — generate clips with the pipeline below for every line it can say. No browser TTS fallback in shipped content.
- Never claim something was tested if it wasn't. Never invent test results. Report what was and wasn't tested.
- Back up before significant changes (`patches/*.orig.js` or a copy of the file). Don't break systems that already work. Don't delete existing features without a reason.
- Don't show dangerous content to the player just to test safety filters.
- When he asks a question mid-task: answer first, then continue.
- Look at every screenshot before sending it and check it makes logical sense.

## Layout
- `client/index.html`, `client/style.css`, `client/js/*.js` (minified, string-keyed: `a['method']`), `client/assets/` (models, sfx, music, voice).
- `client/integrity.json` = SHA-256 of every JS file and index.html, checked by `js/_guard.js`. **Re-hash after every edit** or the game refuses to start.
- Restaurant code: `restaurant.js` (world/loading), `restaurant_shift.js` (shift loop, actions incl. `talk`, `chatter`, `pick`, `wallBetween`), `restaurant_npc.js` (`Npcs`: gary, customers, `sim`, `look`, `sees`, `hear`, `converse`, `speak`, `draw`, `bubble`, `declutter`, specials: deaf grandma / food critic / Officer Dan), `restaurant_fx.js` (ambience, busted/blooper FX), `restaurant_talk.js` + `restaurant_talk2.js` (TOPICS regexes), `restaurant_items.js`. The restaurant runs on the Prison engine (`prison.js`, `prison_world.js`) — old modes (hotel, hospital, parking, space, office) are dead code, not loaded.
- Shared: `people.js` (makePerson, VOICES m [1,3,5], f [0,2,4], boy [8], girl [6,7]), `uniform.js` (wearKit/wearPick by bone name), `avatars.js` (handsUp/shout/wave), `voice.js` (proximity voice chat: full ≤4 m, zero at 18 m, stereo pan), `stt.js` + `stt_worker.js` (Whisper; `peak` = loudness), `meta.js` (ACHIEVEMENTS, `achieve(id)` → Steam `EO_` prefix + toast), `steam.js`, `audio.js` (AudioEngine: master → compressor; buses music/sfx/ambient/voice/ui; `_out(bus,pos,vol)` builds a PannerNode), `ui.js`, `world.js` (model allow-list in `load` → `h`), `phone.js` (boss phone, en-US male).
- Server: `server/server.js`, `rooms.js`, `rules.js`. Multiplayer snapshot: NPC `spc` flag is index 19.
- Tools: `tools/voice/` (gen_voice.py, kid_voice.py, VOICES.md, lines_*.json), `tools/art/`, `tools/steam/` (STEAM_SETUP.md, achievement icons).

## How to patch minified JS safely
1. Back up the file. 2. Locate the exact substring; **assert it occurs exactly once** (count) before replacing. 3. Replace with a string edit, keep `const`→`let` in mind when you reassign. 4. Run the syntax check (`node --check`). 5. Re-hash `integrity.json`. 6. Run the Playwright smoke test. If an assertion finds the string twice, change the replacement order or widen the anchor — never replace blindly.

## Voice pipeline (Kokoro TTS, no AI-sounding voices)
- Clips live in `client/assets/voice/rr/` with `index.json` mapping a **normalised key** to clip lists in groups `gary`, `cust`, `contact`. Normalisation in `speak()`: lowercase, `…`→space, strip everything outside `[a-z0-9 ]`, collapse spaces; then chains up to 4 longest-prefix keys. A key with double spaces never matches — add aliases.
- Voice map (slot → Kokoro voice): gary0 am_michael · cust0 af_bella · cust1 am_adam (Officer Dan) · cust2 af_sarah · cust3 am_liam · cust4 bf_emma (Grandma) · cust5 am_echo (critic) · cust6 af_bella speed 1.15 +4.9 st · cust7 af_sarah speed 1.15 +4.3 st · cust8 af_nova speed 0.8, asetrate ×1.51 (boys) · contact0 bm_lewis speed 0.9 · boss phone bm_george (`assets/voice/boss/index.json`).
- Kids: pitch via ffmpeg `asetrate` + `aresample` + `atempo` (recipe in `kid_voice.py`). Post: trim, 35 ms lead, RMS-normalise to 0.08, Vorbis q3 @ 24 kHz.
- Model files from github.com/thewh1teagle/kokoro-onnx releases (HuggingFace is blocked here).
- Workflow: write `[group, who, text]` JSON (text = exactly the bubble text) → `python gen_voice.py new file.json` → verify every clip with the game's own Whisper worker (ASR must match) → run the speak-coverage test (0 unvoiced lines, 0 browser-TTS fallbacks).
- Special customers have fixed voices (deaf 4, critic 5, cop 1).

## Audio
- NPC speech goes to the `voice` bus (gain gary 1.6 / cust 1.5, refDistance 3, rolloff 0.9). Ambience: crowd 0.42, grill 0.6, fryer 0.55, street loop 1.3 (`rr_amb_street.ogg`).
- `index.html` has an audio-wake script (resume AudioContext on pointerdown/keydown/focus/visibility, every 2 s) — keep it before `_guard.js`.
- Measure levels with an AudioWorklet meter in the test, don't guess.

## Gameplay knobs (current "hard" tuning — Mesika asked for a much more aware boss)
Gary: sight 18 m, FOV check `m>3 && q<0.05`, lookT 0.12, suspicion decay 0.035, bump ×1.6, speeds 3.7/2.15, watch 2.2 s, office stay 25–60 s, inspect chance 0.55, bag noticed at >0 items, big bag ≥8. Siren 11/16 s, after escape sirenCool +25 s, sus 45. Loud talk (`stt.peak ≥ 0.6`) is overheard. Tune only after Mesika plays and reports.

## Testing (what "tested" means here)
- Playwright + Chromium, headless with swiftshader; `window.__game` exposes `game.prison.content` (the shift). Fast-forward with `sh.sim(0.1)` in a loop; run long tests in the background with `nohup`. `waitForFunction(fn, null, {timeout})` — argument order matters.
- Standard suite after any change: syntax check all JS → integrity rehash → load + 60 s sim with no console errors → reach test (every interactable reachable, none through walls via `wallBetween`) → NPC stuck test (900 s sim) → speak coverage → two-browser multiplayer sync → screenshots of the HUD at 1920×1080 and 1366×768 (check overlaps: phone, bubbles, subtitles, version label vs REPORT A BUG).
- Cannot be tested here: real FPS on a GPU, 3–4 real players, voice chat between real PCs, Steam overlay/achievements. Say so explicitly.
- CSS transitions stall in headless: verify opacity-based overlays in isolation.

## Three.js reminders for this project
- Lighting is physically based (r155+): key DirectionalLight ≈ 2–3; `scene.environment` from PMREM; `NeutralToneMapping`; end any EffectComposer chain with `OutputPass`.
- Colour maps `SRGBColorSpace`; data maps linear. GLTFLoader tags glTF textures already.
- Perf: profile first (renderer.info draw calls/triangles), then post/shadow cost, then cull/LOD/instance. One shadow-casting DirectionalLight; no PointLight shadows.
- Game feel: feedback is layered (sound + particle + brief shake + flash) and **returns to rest**; shake the camera, never the body; scale to importance (busted = large, pickup = small).

## Packaging
Deliver as `StealFromYourBoss_Fixed.zip` without `runtime/` and without `server/node_modules`. Backups in `/home/claude/audit/`.