---
name: "sfyb-game-design"
description: "Use for gameplay design on Steal From Your Boss: boss/NPC AI, level design (THE BANK), game feel/juice, HUD/UI, saves/progression and performance. Adapted from Game Forge."
---

# Steal From Your Boss — game design playbook

Adapted from Game Forge (github.com/efeislekel/game-forge-claude-skill, MIT/Apache-2.0) and rewritten for this game: first-person co-op heist, three.js client with minified string-keyed JS, Node server, WebView2/Steam build.

## Order of authority (never break)
1. Mesika's own instructions in this conversation.
2. Skill `sfyb-game-engineering`: patch method (backup, exact-once anchor, node --check, re-hash integrity.json, Playwright tests), voice pipeline, honesty rules.
3. Skill `sfyb-blender-modeling` for every 3D asset (cartoon style, built in Blender).
4. This skill: design ideas and numbers only.

Hard limits:
- NEVER scaffold a new project, add Vite/TypeScript, a bundler, or restructure folders. The game stays as it is.
- NEVER rewrite a working system to fit a pattern below. Apply patterns only to new code or a system Mesika asks to change.
- No GDScript/Unity/Godot code — translate ideas to plain JS inside the existing files.
- Don't retune Gary's current "hard" values unless Mesika reports after playing.
- Keep the old boss office and the limousine.

## 1. Boss & NPC AI (Gary, customers, THE BANK guards)
- Three layers: decide (state) → steer (motion) → path (route). Decision outputs an intent only.
- Few clear states (patrol / suspicious / watch / chase / office) → FSM with enter/update/exit; transitions live inside the state, not scattered flags.
- Many prioritized interruptible behaviours → behaviour tree; multi-frame actions return RUNNING until done.
- Steering: seek = desired − current velocity, clamped; arrive slows inside a radius; always integrate with dt.
- Follow cached waypoints, advance within a radius; don't steer straight at the goal (corner-hugging).
- Repath on a timer or when the target changes cell, never every frame.
- Stuck check: no progress for N seconds → repath or change state (ties to the existing 900 s NPC stuck test).
- Suspicion should be readable to players: clear telegraph (head turn, "?" sound/bubble) before a bust. Fair > punishing; a co-op game must be funny when you fail.
- Debug: draw path + current state above the NPC in test builds only.

## 2. Level design (THE BANK, Level 2)
- Order: metrics → greybox blockout → playtest → only then dress with Blender art. No art pass before the layout plays well.
- Metrics from the real controller constants (walk/run speed, crouch height, interact distance, Gary's 18 m sight). Corridor and cover sizes follow those numbers.
- Define the critical path (enter → vault → van) and the golden path; add optional loot routes and secrets on top.
- Write pacing as a beat list with intensity 0–1, sawtooth rising (calm casing → first steal → alarm risk → escape). No flat high-tension.
- Teach a mechanic safely before testing it under pressure (e.g. first keycard with no guard watching).
- Co-op: design jobs that need 2+ players (one distracts, one steals; lift heavy bags together; one watches cameras).
- Guide with light, lines, landmarks — not invisible walls. Telegraph anything irreversible (doors that lock behind you).
- Soft-lock check: reachability test — collect keys/grants, follow exits whose requirement is met, goal must be reachable. Add it to the existing reach test (`wallBetween`).

## 3. Game feel (juice)
- Layer feedback per event: sound + particle + brief camera shake + flash/pop; 2–3 channels first, add until it reads.
- Tiers: small (pickup, coin), medium (bag full, door open), large (busted, alarm, escape). Every event gets a tier.
- Trigger from discrete events (onPickup, onBusted, onAlarm). Add hooks first if missing.
- Shake = decaying trauma 0–1, intensity = trauma², smooth noise/sin, applied to the camera offset only — never the player body.
- Everything returns to rest. Eased tweens (ease-out / back overshoot for pops), never linear.
- Any hit-stop/slow-mo restores with real time (performance.now), only the newest one restores.
- Settings: reduce screen shake, reduce flashing.
- Verify by triggering repeatedly: shake decays, scale back to 1, input still works.

## 4. HUD & UI
- Reference 1920×1080, anchor HUD to corners, no absolute pixels in new UI. Test 1920×1080 and 1366×768 (existing rule) plus ultrawide 2560×1080.
- Font floor ~18 px at 1080p on PC; usable at 200% scale.
- Screens as a push/pop stack (title → lobby → game → pause → settings), not boolean flags.
- HUD updates from events (bagChanged, susChanged), not polling every frame.
- Gamepad: every screen has a starting focus and a visible focus highlight.
- Check overlaps: phone, bubbles, subtitles, version label vs REPORT A BUG.

## 5. Saves & progression (levels, unlocks, achievements)
- Save data, never objects. Version integer in every save from v1.
- Atomic write: temp file → keep .bak → rename. On load: main, then .bak on failure.
- Migrations v→v+1 as pure functions; refuse saves newer than the build; validate fields.
- Autosave only at safe points (end of shift, level change), throttled.
- Multiplayer state is server-authoritative; never trust a local save for it. Steam Cloud only once on Steamworks.

## 6. Performance
- Target 60 FPS = 16.67 ms. Mesika's PC (GTX 1660 Super) is a realistic mid target.
- Reproduce the worst scene (full restaurant, all NPCs, 4 players), measure renderer.info (draw calls, triangles) and frame time, fix the single biggest cost, re-measure, report before/after.
- Order of fixes: draw calls (shared materials, InstancedMesh, merged static geometry) → shadows/post → overdraw → JS allocations in the loop.
- Pool particles/props; don't create/destroy per event.
- Headless swiftshader numbers are not real FPS — say so.

## Delivery
Follow `sfyb-game-engineering` testing and packaging. Report exactly what was and wasn't tested.