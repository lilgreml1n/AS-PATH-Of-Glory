# AS-PATH Of Glory · Project constitution

**Repository:** https://github.com/lilgreml1n/AS-PATH-Of-Glory

**Purpose:** a fun, momentum-based jousting arcade game for network engineers. The player is a nerdy network automation engineer riding a flying 1U switch with a patch-cable lance, fighting minions and four parody tech-billionaire bosses (Elon, Bill, Jeff, and Jensen as the final boss) above a lava pit. Networking appears as theme and humor. The game does not claim to teach BGP.

**First release:** one browser game in a single static HTML file, with keyboard and touch controls, twelve waves ending in the Jensen fight, then endless mode. Change this scope only by updating this document (see "How we change these rules").

## C1 · The rules are documented and the code matches them

Every gameplay rule the player relies on is written in the README and behaves exactly that way in the game:

- **Height rule:** when two riders collide, the higher lance wins. Lances within 2.5 px of each other count as a tie, and both riders bounce off.
- **Dropped dies:** they score 250, 500, 750, then 1000 per wave, plus 500 for a mid-air catch. An uncollected die reboots after about 6–11.5 s into the next enemy tier.
- **Waves:** bosses on waves 3, 6, 9 and 12 (Jensen). Egg waves every 5th wave. Survival waves on waves 2, 7, 17 and so on. The bridge melts from wave 4. In endless mode a boss rematch comes every 4th wave.
- **Extra life:** one every 20,000 points, or bought in the store.
- **Power-ups:** a defeated minion drops one 12% of the time and a defeated boss always does; the three kinds are equally likely. An untouched pickup vanishes after 8 s. *Blackhole Route* is a stored bomb (hold up to 3; a pickup at 3 pays 500): firing it removes every minion, walker and package on screen for their normal points with no dies dropped, and takes one health bar off each boss. *Zero-G Uplink* gives 8 s of 35% gravity during which the lava hand cannot grab. *Root Access* gives 6 s in which touching any rider defeats it (one health bar for a boss) and the Wyvern is harmless; lava still kills. Timed power-ups end with the life.
- **Incidents:** a fault appears on a platform every 9–15 s (one at a time, two from wave 6) and expires after 10 s unattended. Standing on it for its listed time (1–2.5 s) fixes it and pays its listed points (500–1,500) and credits (1–3). A boss defeat pays 5 credits.
- **Store:** opens after every boss wave. Prices: bomb 4, Zero-G 3, Root Access 5, spare lance slot 6 (up to 7 lances), one-wave bridge patch 6, extra life 10. Credits last for one run.
- **Cheat code:** typing `iamacheetah` during a wave gives 5 bombs; that run's score is then not saved as the high score.
- **Thrown lances:** the player carries 5 per life and throws with `W` (0.22 s minimum between throws). Each lance flies straight for 0.75 s at 600 px/s, then falls. It passes through minions, and the nth kill in one throw scores n × the minion's points. It stops in a boss for one hit. A kill after the lance wraps the screen adds +1000. Catching it in mid-air scores +250. A beak hit on the Wyvern scores +1500. A lance lost in lava is returned 5 s later. The player collects lances by touching them, up to 5. With at least one lance in hand the height rule applies as normal; with none, any contact with a rider costs a life. Losing a life restores the full set (5, plus any spare slots bought).

Networking jokes in the game may be playful, but anything stated as a networking fact must be accurate. Fictional themes may decorate a rule; they must not hide or change it.

**Evidence:** the README rules table, traced to the constants and functions that implement each rule.

## C2 · Momentum and lance height are the core decision

Every fight is decided by position: the height rule when jousting, aim and lance height when throwing. The only projectiles are the player's own lances (5 per life), and throwing the last one leaves the player unarmed until they pick one up. Each throw therefore trades safety for reach, and it never replaces the height rule. Each boss special move gets a visible warning or a readable opening: Elon's "!" before he dashes, Bill's fade-out before he teleports, and each boss's low cruise phase between chases. A death must always be explainable by the height rule, being unplugged, or a documented hazard (lava, the Hype Wyvern).

Power-ups are the documented exception to "decided by position". The bomb and Root Access defeat riders without the height rule, so each is scarce and bounded: the bomb is a stored, limited item that the player earns or buys, and Root Access lasts 6 seconds with a visible and audible warning before it ends. Neither one ever makes the player die in a way the paragraph above does not explain. Incidents keep the positional trade: fixing one means standing still on a platform while riders are in the air.

**Evidence:** a playthrough in which each boss is beaten using only the openings described in the README.

## C3 · Difficulty is fair and scoring is honest

Lives, scores, the anti-stall Hype Wyvern and survival bonuses are part of the design. Each scoring event awards its points exactly once. Respawn protection lasts until the player moves or flaps, or 4 seconds pass; a mouse pointer that has not moved since the respawn does not count as moving. The high score is stored only in the player's own browser. A run that used the cheat code is labelled on screen and never changes the high score.

**Evidence:** a check that one defeat, catch or boss hit awards points once, and a record of the respawn-protection behaviour.

## C4 · Access is part of the core game

All core actions work from the keyboard. On touch screens, on-screen buttons replace the keyboard. A mouse can also steer (the rider flies toward the pointer), flap, throw, fire bombs and use the store; pause and mute stay keyboard-only. Visual cues come with text where meaning depends on them: boss names and health bars, banners, "FLAP!" counters, and the "MUTED" label. With prefers-reduced-motion set, screen shake turns off and blinking is replaced by steady transparency. The game stays playable in a narrow browser window.

**Evidence:** a keyboard-only playthrough, a narrow-window check and a reduced-motion check. Record what was actually checked; do not claim full accessibility certification.

## C5 · The game is self-contained

The game ships as static files. It needs no account, backend, API key or model at run time. Web fonts are optional: if Google Fonts cannot load, the game falls back to system fonts and stays fully playable. AI may help write code and assets; its output gets the same review as any other contribution.

**Evidence:** a clean browser session, run offline, plays from the repository's files alone.

## C6 · Tuning lives in data, separate from the engine

Enemy tiers (`TIERS`), bosses (`BOSSES`), the wave schedule (`waveKind`), power-ups (`POWERUPS`), incidents (`INCIDENTS`), store items (`STORE`), egg points and physics constants are declared as data near the top of the source. Gameplay rules read those values instead of repeating numbers. To add a boss, you add a `BOSSES` entry, its special-move branch and its drawing function. The collision and scoring code stays unchanged.

**Evidence:** a review that traces one boss from its data entry through the update and collision code.

## C7 · Done is demonstrated

Ship only the agreed scope. The README and this constitution must describe the same game. A feature is complete when its checks pass and its actual status is recorded. A screenshot, a checked box, or an agent saying "done" is not enough by itself. When time is short, cut scope explicitly. Fix broken core interactions before adding visual effects. Keep failed and untested checks visible (see "Current status").

**Evidence:** a reproducible build command (`./build.sh`), recorded verification results, and a fresh-start playthrough.

## C8 · The game has 80s 8-bit sound

Every sound is original and synthesized at run time with the Web Audio API. The code in `src/game.html` (the `tone` and `sfx` definitions) is the script that regenerates every sound. No audio is copied from an existing game, and no real person's voice is used or cloned. The boss-wave announcer uses the browser's built-in text-to-speech with a generic system voice. It is silent when muted and simply absent where the browser has no speech; the on-screen warning banner carries the same information. Sound adds to a visual cue and never replaces it, so the muted game is fully playable. Audio starts on the player's first key press, click or tap. Mute (`M`) is saved in the browser and shown on screen.

**Evidence:** the README's sound list, plus a round played with sound on and again muted.

## C9 · Unit tests prove it works

The pure game logic gets automated unit tests run by one documented command (`node --test`, which finds `tests/*.test.js`). The tests load the block of `src/game.html` between `// <logic>` and `// </logic>`, so they run the shipped code and not a copy. Finding zero tests counts as a failure. Expected values come from this document and the README, never from running the code. The logic to test covers the height rule and tie threshold, screen-wrap distance, the wave schedule, egg-chain points, extra-life thresholds, and mute handling (including running with no `AudioContext` at all). A test is never deleted, skipped or weakened to make a build pass.

**Evidence:** the test command and its recorded output.

## C10 · Parody is good-natured

The bosses are recognisable caricatures of public figures in a non-commercial parody. The game uses no real logos, trademarked artwork or brand marks, and no real or cloned voices. It makes no defamatory claims; quips stay light and focus on public personas. The README carries a disclaimer that the project is not affiliated with or endorsed by anyone it depicts.

**Evidence:** a review of every boss line and drawing, and the README disclaimer.

## Current status (recorded 2026-11-17, updated 2026-11-23)

| Principle | Status |
|---|---|
| C1, C2, C3, C6, C10 | Implemented. No recorded playthrough yet. |
| C4 | Keyboard, touch and reduced-motion handling are implemented. The keyboard, narrow-window and reduced-motion checks have **not** been run yet. |
| C5 | Implemented. An offline run has **not** been recorded yet. |
| C7 | `./build.sh` exists. A fresh-start playthrough has **not** been recorded yet. |
| C8 | Implemented, including a saved and displayed mute setting. A sound-on and muted playthrough has **not** been recorded yet. |
| Lance throw, name tags, boss announcer | Added 2026-11-17. A headless smoke run of the real game script (browser stubbed, not committed) passed: throw, range drop, pickup, two-minion chain (+1500), lava melt and the 5 s RMA, unplugged contact costing a life, boss banners and announcer lines for Elon, Jeff and Jensen, and 30 s of random play with no errors. Nobody has played these in a real browser yet. |
| Browser playthrough | Recorded 2026-11-23 with `node tests/browser.js` (headless Firefox 160, driven over Marionette): 27 of 27 checks passed. On the untouched `index.html`, real key presses started a game, steered, flapped, threw, typed the cheat code, fired a bomb, paused and muted, with no JavaScript errors; a 500 px wide window showed no horizontal scroll. On a copy with one added line exposing game state: real mouse moves and clicks steered, flapped, threw and fired bombs; an incident was fixed in real time for its listed reward; and a bot using keyboard events played one unassisted run from wave 1 through Elon, Bill, Jeff and Jensen, the victory screen, the store after waves 3, 6, 9, 12 and 16, and endless mode to wave 17 in about 6.5 minutes with no JavaScript errors. **Limits:** this is a bot, not a person; it says nothing about feel, difficulty or sound. The bot never managed to fix an incident by itself (27 expired), and it earned 9 extra lives, which suggests thrown lances are very strong in precise hands. No human playthrough, touch-screen run, offline run or reduced-motion check has been recorded. Jensen's last words and a fix for two overlapping pop-ups were added after that run; they are covered by the smoke test, by the demo recording (which ran the final build in Firefox with no JavaScript errors), and by a repeat of the real-key-press part of the browser test on the final build. |
| C9 | **Partly met** (2026-11-23). `node --test` runs 13 tests, all passing, covering the wave schedule, store schedule, power-up drops and durations, incident data and fix progress, and store prices and limits. **Still untested:** the height rule and tie threshold, screen-wrap distance, egg-chain points, extra-life thresholds and mute handling. Those live outside the `<logic>` block and need moving into it first. |
| Power-ups, incidents, store, cheat code | Added 2026-11-23. `node tests/smoke.js` (the real game script with the browser stubbed, now committed) passed all 57 checks in 60 of 60 runs, and all 72 after mouse controls and boss last words were added: each pickup, the 8 s expiry, Zero-G gravity and lava-hand immunity, Root Access against a higher minion while unplugged, lava still killing, the bomb's kills, points and boss damage, incident fix timing, rewards and expiry, the incident cap, every store purchase and refusal, click-to-buy, the bridge patch lasting one wave, queued power-ups starting with the wave, the cheat code and its high-score lock, and 240 s of random play with rendering. Headless Firefox screenshots of two staged scenes (a wave with pickups, incidents, both timed power-ups and the cheat label; the store with a mix of available and refused items) were looked at once and drew correctly, with the web fonts not loaded. Nobody has played these features in a browser yet, and the touch BOMB button, store taps on a phone, and the new sounds are unchecked. Prices and drop rates are first guesses and have not been tuned by play. |

## How we change these rules

For any material change, record the reason here, update the README, and re-check the affected principles. A conflict with this constitution is resolved openly. The build must not weaken a principle merely to make an implementation pass.

### Amendment log

- **2026-11-17: game redefined.** Owner decision, in the owner's words: "amend the constitution to fit our game." The earlier version described a three-level BGP AS_PATH teaching game (RFC 4271 grading, no lives or timers, data-driven levels, sounds from the house audio kit as `.wav` files). The project became the arcade jouster instead. These changes follow from that:
  - The Purpose was replaced.
  - C1 now covers documented game rules instead of BGP accuracy.
  - C2 now covers the height-rule decision instead of BGP learning rounds.
  - C3 now allows lives, timers and score.
  - C6 now covers tuning data instead of level content.
  - C8 now allows sounds synthesized at run time, generated from code in the repository, instead of kit `.wav` files.
  - C10 was added for parody.
  - C4, C5, C7 and C9 keep their intent.
- **2026-11-17: lance throw, name tags, boss announcer.** Owner requests, in the owner's words: "we need to be able to throw the joist", "we need some rules for this please make it kind of fun", "make the characters more pronounced at least have their name at the bottom of the screen", and "make sure to announce the wave when it happens if it's elon or jensen or bezos". The owner chose: unarmed until picked up, one boss hit per throw, `X`/`Shift` plus a THROW touch button.
  - C2 no longer says "no attack button and no projectiles that kill". It now allows the player's own lance as the only projectile, at the cost of being unarmed.
  - C1 lists the throw rules.
  - C8 allows the browser's generic text-to-speech voice for the announcer.
  - The README documents the throw rules, name tags, bottom roster and boss announcement.
- **2026-11-23: power-ups, incidents, store, cheat code.** Owner requests, in the owner's words: "after killing a thing we get a bomb that wipes the screen", "an anti gravity item", "temporary shield that works like a star from super mario where you just kill the guy", "bonus things out there in the world to help us get more life… 'fix arp poisoning', 'fix low light levels', 'fix routing loop'", "we should build a store where you can buy stuff", and "add a cheat code 'iamacheetah' this gives you 5 bombs". The owner approved the proposed design (stored bomb on `S`, stand-to-fix incidents, store after boss waves) with "i like it for this send it, lets build".
  - C2 gains a paragraph making power-ups the documented, bounded exception to "every fight is decided by position".
  - C1 lists the power-up, incident, store and cheat rules. The extra-life rule now includes the store.
  - C3 says a cheated run never changes the high score. The owner asked only for the bombs; the high-score lock was added by the builder to keep "scoring is honest" true and is open to the owner's veto.
  - C6 names the three new data tables.
  - C9's command changed from `node --test tests/` to `node --test`, because Node 22 treats a directory argument as a single module and fails. The first 13 tests were written.
  - The README documents all of the above. `ARCADE.md` is the record of the earlier submission and was left as submitted.
- **2026-11-23: mouse controls, Jensen's last words, demo.** Owner requests, in the owner's words: "can we make this mouse friendly so we're not just using to keyboard?", "when jesen is defeated, his saying will i'll see you back in the board room!", and "can you build a short demo video for those who are on git hub?".
  - C4 now lists mouse play (steer toward the pointer, left click flap, right click throw, middle click or the BOMB counter for bombs). Keyboard and touch are unchanged.
  - C3's respawn-protection rule says a pointer that has not moved since the respawn does not count as moving.
  - Jensen's line is shown as text only (a speech bubble where he falls, and on the victory screen). The announcer voice does not speak it, in keeping with C8 and C10.
  - The demo is a staged highlights reel recorded from the real game; the README says so.
- **2026-11-17: throw on W, 5 lances.** Owner request, in the owner's words: "change the weapon and lance to the w key and then give 5 lances". `W` now throws instead of flapping (flap stays on `Space`/`↑`). The player carries 5 lances per life, collects thrown ones, and is unarmed only when holding none. C1, C2 and the README are updated to match. The headless smoke run was re-run and all 17 checks passed in 20 of 20 runs. Nobody has played it in a real browser yet.
