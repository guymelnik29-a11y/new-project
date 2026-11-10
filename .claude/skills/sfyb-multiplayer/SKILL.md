---
name: "sfyb-multiplayer"
description: "Use for multiplayer/netcode work on Steal From Your Boss: Node WebSocket server sync, lag, desync, cheating, lobby/rejoin, co-op testing."
---

# Steal From Your Boss — multiplayer playbook

Adapted from ericrisco/gamedev-multiplayer (MIT) and ideas from coop-anything (MIT), rewritten for this game: three.js client, Node server (`server/server.js`, `rooms.js`, `rules.js`), up to 4 co-op players, Steam.

## Authority (never break)
1. Mesika's instructions. 2. `sfyb-game-engineering` patch + test rules (backup, exact-once anchors, node --check, re-hash integrity.json, two-browser sync test). 3. This skill.
- NEVER replace the server with a framework (Rivet, Colyseus, Godot, Unity...) or rewrite its architecture. Improve the existing Node server in place.
- Never hand out builds/zips for testing; real multi-PC tests only via Steam keys once on Steamworks.

## Core rules
- Server-authoritative. Client sends intent (move, pick, talk, drop bag); server decides; others observe. Never trust the client.
- Replicate STATE for anything persistent (loot in bag, doors, alarm, Gary's suspicion, NPC positions). Use one-off events only for cosmetic things (a sound, a bubble). A lost event desyncs forever; state self-corrects.
- Ownership explicit at spawn: who owns each bag/item/NPC. Most "works for host, breaks for friend" bugs come from here.
- Shared pure logic (e.g. applyInput(state, input, dt), loot rules) in one module used by both client (prediction) and server (validation).
- Fixed server tick 20–30 Hz, decoupled from client FPS. Sim with fixed timestep, render interpolated.
- Full snapshot on join/rejoin/resync, then diffs per tick. Keep the NPC snapshot layout stable (spc flag is index 19) — add fields at the end.

## Smoothness
- Own player: client-side prediction — apply input immediately; tag inputs with sequence numbers; on server state, replay unacknowledged inputs; correct smoothly.
- Other players and NPCs: render ~100 ms in the past, interpolate between the last two snapshots.
- Teleport/respawn: hard-cut and reset interpolation instead of a long slide.

## Anti-cheat (matters for a paid Steam game)
- Validate every input on the server: max move distance per elapsed time (reject/clamp teleports), interact distance, cooldowns, line of sight (use the same wallBetween logic), bag capacity.
- Client sends an item id, never an amount of money/loot. Check before you add.
- Rate-limit messages server-side.
- Send each client only what it may know where it matters.
- Sanitize loaded/received numbers: NaN, Infinity, negatives → reject.

## Lobby & sessions
- Server-issued player ids/tickets; never trust a playerId sent by the client.
- Host leaves / player drops: decide explicitly (migrate, pause, or end shift) and show a clear message. Rejoin gets a full snapshot.
- Proximity voice chat (`voice.js`) stays as is unless asked.

## Testing
- Never only localhost. Add a test relay that injects latency (100–250 ms), jitter, packet loss, reordering and duplicates between two/four Playwright browsers.
- Invariants to assert after a fuzzed session: all clients converge to the same state; no item picked twice (no dupes); each item has one owner; loot total = server total; no NPC stuck.
- Log a flight record (tick, inputs, state hash) per client to find the first tick of desync.
- Cannot be tested here: real players on different PCs/networks, Steam relay/overlay. Say so.