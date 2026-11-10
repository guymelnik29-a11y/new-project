---
name: "sfyb-steam-launch"
description: "Use when Mesika asks about putting Steal From Your Boss on Steam — Steamworks rules and deadlines, store page assets and copy, trailer, wishlists, Next Fest, pricing, achievements, AI-content disclosure, build upload."
---

# Steam launch for Steal From Your Boss

Goal: a viral co-op game people buy together with friends. Project facts: launcher `StealFromYourBoss.exe` (WebView2 host with an internal HTTP server), `steam_api64.dll`, `steam_appid.txt`, `STEAM_REQUIREMENTS.txt`, `tools/steam/STEAM_SETUP.md` lists the 15 achievements (`EO_` prefix: clockedin, getaway, secret, ghost, lone, squad, service, critic, grandma, officer, butter, warning, busted, fired, office) with 256×256 icons in `tools/steam/achievements/`. All NPC voices are Kokoro TTS → **must be disclosed as pre-generated AI content** in the Content Survey.

Rules of thumb: separate **Valve rules** (cite the Steamworks page) from **community estimates** (say so). Dates/numbers below were checked Nov 2026 — re-fetch the Steamworks page before committing to a deadline. Recommend concretely (a date, a size, a sentence), not a list of options. Tax/company questions: orientation only, point to an accountant.

## Valve rules (partner.steamgames.com/doc/…)
- **Fee**: USD 100 per app, non-refundable, recouped at USD 1,000 adjusted gross revenue. **21 days** between paying and releasing (first titles). Tax/identity check 10–15 business days; non-US devs fill W-8BEN.
- **Coming Soon page** public ≥ **2 weeks** before release. Store review 3–5 business days → submit ≥ 7 business days before. Build review also 3–5 days; after approval, updates need no review. Release never happens by itself: press **Release App**.
- **Store page rejected** if: content shown that's missing at launch, capsule without readable title, screenshots without gameplay, links in the description. **Build rejected** if it doesn't start on a listed OS or a listed feature (controller, cloud, achievements) is missing — so don't tick achievements/co-op in Basic Info until they work in the reviewed build.
- **Assets** (sizes since Aug 2024): header 920×430 · small 462×174 · main 1232×706 · vertical 748×896 · library capsule 600×900 · library hero 3840×1240 (no text, key content centred 860×380) · library logo 1280w/720h transparent PNG · background 1438×810 optional · ≥5 screenshots ≥1920×1080 16:9 gameplay only, 4 marked all-ages. Capsule text = title (+ official subtitle) only: no awards, quotes, "Wishlist now", discount text.
- **Trailer**: mp4/mov, H.264+AAC, ≤1080p 30/60 fps, 5000+ kbps. First trailer mostly gameplay; Steam auto-cuts a 6 s micro-trailer from it; autoplays muted.
- **Tags**: ≥5 before launch, ≤20; order sets initial weight. Copy tags from 5–10 similar co-op games.
- **Demo**: own App ID linked to base game; one wishlist notification within 14 days of demo release. Leave achievements out of the demo.
- **Next Fest**: once per game, ever. Unreleased, public page, public demo. Demo in review 5 weeks before (press preview) / 3 weeks latest. Feb/Jun/Oct editions. Feb 2027: registration closes Jan 10, demo+page in review by Jan 18 (press preview Feb 11), everything by Feb 1; fest Feb 22–Mar 1. June 2027 fest Jun 14–21. Couch Co-Op Fest Feb 8–15 2027 (relevant!).
- **Discounts**: launch discount 10–40 % for 7–14 days, set before release. No other discount for 30 days after release; 30 days between discounts; seasonal sales exempt from the spacing. Wishlist email on launch, EA exit, and discounts ≥20 % (one email per 2 weeks).
- **Reviews/keys**: never trade reviews for anything; score appears from 10 reviews; only Steam purchases count. Keys: up to 5,000 by default; treat like cash. Curator Connect: 100 curators × 5 copies.
- **Early Access**: only if already fun and updates are realistic; gives a second launch moment at 1.0.
- **Steam Deck** compatibility is a separate review, doesn't block release.
- **AI disclosure** (Content Survey, reworked Jan 2026): pre-generated content players see/hear (our voices, any AI art/text) must be listed; dev-only helpers need not. Some answers can't be edited after approval.

## Build upload (SteamPipe)
1. Partner account → App ID. Create a **separate build account** with only Edit App Metadata + Publish App Changes (+ Manage pricing for Coming Soon/release); attach Mobile Authenticator.
2. App Admin → Installation: launch option = `StealFromYourBoss.exe` (Windows). Depots page: one "Windows Content" depot. Add it to the Developer Comp package. **Publish** the config (unpublished config = most upload failures).
3. Steamworks SDK `tools/ContentBuilder/`: put the final build in `content/`, script in `scripts/app_build_<APPID>.vdf` (AppID, Desc, ContentRoot `..\content\`, BuildOutput `..\output\`, Depots { <DEPOT> { FileMapping { LocalPath "*", DepotPath ".", recursive "1" } } }). Add `"Preview" "1"` for a dry run. `"SetLive" "beta-qa"` only for a beta branch — `default` must be set live by hand.
4. `builder\steamcmd.exe +login <build_account> +run_app_build ..\scripts\app_build_<APPID>.vdf +quit`. Never commit passwords or `config.vdf`.
5. Builds page → Preview Change → Set Build Live on a password-protected beta branch first (set the password *before* going live). Test with 2–4 real players. Then Game Build checklist → Mark as ready for review.
6. Exclude from the depot: `server/node_modules`, `runtime/`, `tools/`, backups, `.orig.js` patches.

## Store page that sells a co-op heist game
- Capsule: one clear subject in the middle of the core activity (a chibi worker sneaking loot past Gary), title readable at 184×69. Test it shrunk next to 10 competitor capsules.
- Trailer: gameplay in the first 5 seconds, 30–90 s, friends laughing / busted bloopers, ends with title. Render at 24 fps minimum like Mesika's trailers (he edits in After Effects).
- First 4 screenshots = 4 different mechanics (serving, stealing, talking to a customer, getting busted). No menus.
- Short description (~300 chars): "A [genre] where you [core fantasy]. [Activity 1], [activity 2] and [activity 3] until [escalation]." e.g. *A co-op heist comedy where you work a burger shift and rob your boss. Serve customers, sweet-talk them in your own voice, stuff the bag while Gary isn't looking, and get out before the cops arrive.*
- Long description: GIF of the core mechanic first, then 3–5 headed sections each with a GIF; only shipped features; no external links; a version per store language.
- Tags for this game (check against comparable games): Co-op, Online Co-Op, Multiplayer, Comedy, Stealth, Heist, First-Person, Funny, Casual, Cooking, Voice Chat.

## Wishlists (community estimates, Zukowski/GameDiscoverCo, as of mid-2026)
- ~7,000 wishlists ≈ Popular Upcoming; tiers 5k bronze / 8k silver / 50k gold. First-week conversion ~10–20 %. Rough revenue = wishlists × 0.15 × price × 0.7.
- Best channels for a solo dev: store page up early → Next Fest + themed fests (Couch Co-Op) → 10–20 s clips of one funny moment (TikTok/Shorts/Reddit, GIF not ad copy) → small/mid streamers who play co-op comedy games (personal email + key, track in a sheet) → Steam announcements. Paid ads before launch rarely pay.
- Demo: first 20–30 min with a clear ending and a Wishlist button; release 1–3 months before Next Fest.

## Launch and after
- Launch Mon–Thu, US morning, not during big sales or same-genre releases. Price from 5–10 comparable co-op games; slightly higher + 10–20 % launch discount beats too low. Take Valve's regional pricing.
- First week: fix bugs immediately, reply to reviews, ship a small feedback update. After 30 days: seasonal sales, Update Visibility Rounds for big updates (e.g. THE BANK level).

## Release-plan checklist
- [ ] Pick a launch month; fix the day after Next Fest.
- [ ] Pay fee ≥ 21 days + tax check (15 business days) before launch.
- [ ] Coming Soon page 6–12 months before launch if possible (minimum 2 weeks).
- [ ] Assets at the exact sizes above; run a size check before submitting.
- [ ] Content Survey incl. AI voice disclosure.
- [ ] Basic Info lists only working features; build starts on every listed OS.
- [ ] Beta branch tested with real friends; then review; then Release App by hand.