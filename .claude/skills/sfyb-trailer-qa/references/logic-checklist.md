# Logic checklist — what to look for in every frame

Go through this list for EACH frame. The question is always: "if a person watched this on Steam, would anything look wrong, broken, or physically impossible?"

## A. Floating / unsupported things (Mesika's #1 complaint)
- Any object, character, prop, vehicle or text that is in the air with nothing under it, and no reason to be (not jumping, not thrown, not a helicopter).
- Feet not touching the floor; character hovering a few centimetres above ground. Compare the shadow / contact point.
- Props resting on nothing: a tray, a burger, a bag of cash floating beside a table instead of on it.
- Hair / clothing / accessories detached from the body.

## B. Clipping / intersections
- Character passing through a wall, door, counter, table, car, another character.
- Arms or weapons going through the body, head through a ceiling, hands through a held object.
- Camera inside geometry (seeing the inside of a wall — flat colour or missing faces).
- Objects half-sunk into the floor or into each other.

- Mutual occlusion: A covers part of B and B covers part of A in the same frame → inside each other (bug). One-way occlusion → just behind (fine).
- Foot sliding: character travels but the legs keep the same pose frame to frame.

## C. Things breaking / collapsing / popping
- Rigs collapsing (limbs bending the wrong way, body folding).
- Objects stretched, inverted, scaled wrong, mirrored text.
- Textures missing (pink / black / white flat surfaces), flickering materials, z-fighting stripes.
- Sinking: bottom edge flat at floor level while the object gets shorter (crates/props falling through the floor).
- Holes: sky or void colour showing through a floor or wall.
- Pop-in: objects, shadows or LOD appearing mid-shot. Compare with the previous frame.
- Animation snapping (a character teleports between two frames with no cut).

## D. Scene logic
- Each shot makes sense on its own: where is the camera, who is in frame, what are they doing, why.
- Characters looking at nothing / talking to no one when the context implies otherwise.
- NPC/boss reacting to the player when he should not (or not reacting when he should).
- Cause and effect: an item that was stolen in shot 3 should not be back on the shelf in shot 4 if it is the same scene.
- Multiplayer scenes: each player visible and doing something plausible, no clones.

## E. HUD / UI / text
- HUD elements overlapping each other (phone, speech bubbles, subtitles, version label, "REPORT A BUG").
- Debug text, FPS counter, console, cursor, browser chrome, Windows taskbar, Electron frame — anything that should not be in a trailer.
- Placeholder text ("Lorem", "TODO", "undefined", "NaN", "[object Object]").
- Title / subtitles cut off at the edge, misspelled, wrong language, inconsistent font.
- Text readable at a glance (size and contrast) — remember Steam autoplays muted and small.

## F. Continuity between frames of the same shot
- Lighting or time of day changing without a cut.
- Objects that move with no motion in between (check consecutive frames).
- Character outfit / model changing mid-shot.

## G. Trailer structure (check across the whole set)
- Gameplay in the first 5 seconds (Steam cuts its 6 s micro-trailer from the start).
- Game title / logo appears, readable, at the end.
- Nothing important happens only in audio (it autoplays muted).
- No shot so short it reads as a glitch.

## What is NOT a bug
- Cartoon exaggeration that is clearly deliberate (squash & stretch, big jumps, slapstick).
- Intentional slow-motion, freeze-frames with a title card, black with a sound cue.
- Stylised low-poly geometry — judge against the game's own cartoon style, not realism.
When unsure, report it as "לבדיקה" (to check) rather than as a bug, and say why.
