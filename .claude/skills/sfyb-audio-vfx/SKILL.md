---
name: "sfyb-audio-vfx"
description: "Use for sound mixing, music, SFX variety and shader/VFX work on Steal From Your Boss (Web Audio buses, GLSL in three.js)."
---

# Steal From Your Boss — audio & VFX playbook

Adapted from gamedev-skills audio-design and shader-programming (Apache-2.0), rewritten for this game's `audio.js` AudioEngine and three.js renderer.

## Authority
Mesika's instructions → `sfyb-game-engineering` (patch/test rules, voice pipeline, existing bus gains) → this skill. Don't rewrite AudioEngine or the renderer; extend in place. Keep the audio-wake script before `_guard.js`.

## Audio
- Everything through the existing buses (music / sfx / ambient / voice / ui → master → compressor). Balance groups, not single clips.
- Settings sliders 0..1 map to gain on a curve (gain = slider² or dB mapping), never linear dB.
- Headroom: aim around −14 to −16 LUFS overall; master compressor is a safety net, not the mix.
- Ducking: when an NPC or the boss phone speaks, lower music ~−12 dB over 0.25 s, restore after (Web Audio gain ramp, setTargetAtTime). Long release so music doesn't pump.
- No "machine-gun" repeats: 3–5 variations per frequent sound (steps, coins, bag rustle, doors) + random pitch 0.94–1.06 + small volume jitter.
- Adaptive music: stems that fade in by tension (calm shift → suspicious Gary → alarm → getaway), switch at bar boundaries. Ties to the heist pacing curve.
- Spatial: positional sounds via `_out(bus,pos,vol)`; keep refDistance/rolloff consistent with NPC voice.
- Measure with the AudioWorklet meter in tests; never guess levels. Real headphones/speakers can't be tested here — say so.
- New character voices still follow the Kokoro voice pipeline (no AI-sounding voices).

## Shaders / VFX (three.js, WebGL2)
- ShaderMaterial in GLSL ES 3.00: add `precision highp float;`, set uniform defaults from JS (GLSL ES rejects initialized uniforms).
- Keep WebGLRenderer for raw GLSL (WebGPURenderer renders it blank).
- One coordinate space per effect; convert everything into it.
- Prefer step/smoothstep/mix/clamp over if; reversed smoothstep is undefined — write 1.0 - smoothstep(a,b,x).
- Time-driven effects use a real time uniform; scroll with fract(uv + speed*time).
- Useful effects for this game: alarm red pulse/vignette, Fresnel rim highlight on stealable items (pow(1-dot(N,V),p), both normalized), dissolve for money/loot pickup (threshold noise + edge tint, guard amount 0), busted flash.
- Avoid `discard` and big stacked transparents (overdraw); pool particles.
- VFX follow the game-feel tiers (small/medium/large) and return to rest; offer reduce-flashing.
- Real GPU cost can't be measured headless — check renderer.info and say what wasn't tested.