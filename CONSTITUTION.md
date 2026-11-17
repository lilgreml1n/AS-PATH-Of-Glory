# AS-PATH Of Glory · Project constitution

**Repository:** https://github.com/lilgreml1n/AS-PATH-Of-Glory

**Purpose:** a fun, momentum-based jousting arcade game for network engineers. The player is a nerdy network automation engineer riding a flying 1U switch with a patch-cable lance, fighting minions and four parody tech-billionaire bosses (Elon, Bill, Jeff, and Jensen as the final boss) above a lava pit. Networking appears as theme and humor. The game does not claim to teach BGP.

**First release:** one browser game in a single static HTML file, with keyboard and touch controls, twelve waves ending in the Jensen fight, then endless mode. Change this scope only by updating this document (see "How we change these rules").

## C1 · The rules are documented and the code matches them

Every gameplay rule the player relies on is written in the README and behaves exactly that way in the game:

- **Height rule:** when two riders collide, the higher lance wins. Lances within 2.5 px of each other count as a tie, and both riders bounce off.
- **Dropped dies:** they score 250, 500, 750, then 1000 per wave, plus 500 for a mid-air catch. An uncollected die reboots after about 6–11.5 s into the next enemy tier.
- **Waves:** bosses on waves 3, 6, 9 and 12 (Jensen). Egg waves every 5th wave. Survival waves on waves 2, 7, 17 and so on. The bridge melts from wave 4. In endless mode a boss rematch comes every 4th wave.
- **Extra life:** one every 20,000 points.
- **Thrown lances:** the player carries 5 per life and throws with `W` (0.22 s minimum between throws). Each lance flies straight for 0.75 s at 600 px/s, then falls. It passes through minions, and the nth kill in one throw scores n × the minion's points. It stops in a boss for one hit. A kill after the lance wraps the screen adds +1000. Catching it in mid-air scores +250. A beak hit on the Wyvern scores +1500. A lance lost in lava is returned 5 s later. The player collects lances by touching them, up to 5. With at least one lance in hand the height rule applies as normal; with none, any contact with a rider costs a life. Losing a life restores all 5.

Networking jokes in the game may be playful, but anything stated as a networking fact must be accurate. Fictional themes may decorate a rule; they must not hide or change it.

**Evidence:** the README rules table, traced to the constants and functions that implement each rule.

## C2 · Momentum and lance height are the core decision

Every fight is decided by position: the height rule when jousting, aim and lance height when throwing. The only projectiles are the player's own lances (5 per life), and throwing the last one leaves the player unarmed until they pick one up. Each throw therefore trades safety for reach, and it never replaces the height rule. Each boss special move gets a visible warning or a readable opening: Elon's "!" before he dashes, Bill's fade-out before he teleports, and each boss's low cruise phase between chases. A death must always be explainable by the height rule, being unplugged, or a documented hazard (lava, the Hype Wyvern).

**Evidence:** a playthrough in which each boss is beaten using only the openings described in the README.

## C3 · Difficulty is fair and scoring is honest

Lives, scores, the anti-stall Hype Wyvern and survival bonuses are part of the design. Each scoring event awards its points exactly once. Respawn protection lasts until the player moves or flaps, or 4 seconds pass. The high score is stored only in the player's own browser.

**Evidence:** a check that one defeat, catch or boss hit awards points once, and a record of the respawn-protection behaviour.

## C4 · Access is part of the core game

All core actions work from the keyboard. On touch screens, on-screen buttons replace the keyboard. Visual cues come with text where meaning depends on them: boss names and health bars, banners, "FLAP!" counters, and the "MUTED" label. With prefers-reduced-motion set, screen shake turns off and blinking is replaced by steady transparency. The game stays playable in a narrow browser window.

**Evidence:** a keyboard-only playthrough, a narrow-window check and a reduced-motion check. Record what was actually checked; do not claim full accessibility certification.

## C5 · The game is self-contained

The game ships as static files. It needs no account, backend, API key or model at run time. Web fonts are optional: if Google Fonts cannot load, the game falls back to system fonts and stays fully playable. AI may help write code and assets; its output gets the same review as any other contribution.

**Evidence:** a clean browser session, run offline, plays from the repository's files alone.

## C6 · Tuning lives in data, separate from the engine

Enemy tiers (`TIERS`), bosses (`BOSSES`), the wave schedule (`waveKind`), egg points and physics constants are declared as data near the top of the source. Gameplay rules read those values instead of repeating numbers. To add a boss, you add a `BOSSES` entry, its special-move branch and its drawing function. The collision and scoring code stays unchanged.

**Evidence:** a review that traces one boss from its data entry through the update and collision code.

## C7 · Done is demonstrated

Ship only the agreed scope. The README and this constitution must describe the same game. A feature is complete when its checks pass and its actual status is recorded. A screenshot, a checked box, or an agent saying "done" is not enough by itself. When time is short, cut scope explicitly. Fix broken core interactions before adding visual effects. Keep failed and untested checks visible (see "Current status").

**Evidence:** a reproducible build command (`./build.sh`), recorded verification results, and a fresh-start playthrough.

## C8 · The game has 80s 8-bit sound

Every sound is original and synthesized at run time with the Web Audio API. The code in `src/game.html` (the `tone` and `sfx` definitions) is the script that regenerates every sound. No audio is copied from an existing game, and no real person's voice is used or cloned. The boss-wave announcer uses the browser's built-in text-to-speech with a generic system voice. It is silent when muted and simply absent where the browser has no speech; the on-screen warning banner carries the same information. Sound adds to a visual cue and never replaces it, so the muted game is fully playable. Audio starts on the player's first key press, click or tap. Mute (`M`) is saved in the browser and shown on screen.

**Evidence:** the README's sound list, plus a round played with sound on and again muted.

## C9 · Unit tests prove it works

The pure game logic gets automated unit tests run by one documented command (`node --test tests/`). Finding zero tests counts as a failure. Expected values come from this document and the README, never from running the code. The logic to test covers the height rule and tie threshold, screen-wrap distance, the wave schedule, egg-chain points, extra-life thresholds, and mute handling (including running with no `AudioContext` at all). A test is never deleted, skipped or weakened to make a build pass.

**Evidence:** the test command and its recorded output.

## C10 · Parody is good-natured

The bosses are recognisable caricatures of public figures in a non-commercial parody. The game uses no real logos, trademarked artwork or brand marks, and no real or cloned voices. It makes no defamatory claims; quips stay light and focus on public personas. The README carries a disclaimer that the project is not affiliated with or endorsed by anyone it depicts.

**Evidence:** a review of every boss line and drawing, and the README disclaimer.

## Current status (recorded 2026-11-17)

| Principle | Status |
|---|---|
| C1, C2, C3, C6, C10 | Implemented. No recorded playthrough yet. |
| C4 | Keyboard, touch and reduced-motion handling are implemented. The keyboard, narrow-window and reduced-motion checks have **not** been run yet. |
| C5 | Implemented. An offline run has **not** been recorded yet. |
| C7 | `./build.sh` exists. A fresh-start playthrough has **not** been recorded yet. |
| C8 | Implemented, including a saved and displayed mute setting. A sound-on and muted playthrough has **not** been recorded yet. |
| Lance throw, name tags, boss announcer | Added 2026-11-17. A headless smoke run of the real game script (browser stubbed, not committed) passed: throw, range drop, pickup, two-minion chain (+1500), lava melt and the 5 s RMA, unplugged contact costing a life, boss banners and announcer lines for Elon, Jeff and Jensen, and 30 s of random play with no errors. Nobody has played these in a real browser yet. |
| C9 | **Not met.** There are no tests yet. The next step is to move the pure logic into a module and write tests against this document. |

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
- **2026-11-17: throw on W, 5 lances.** Owner request, in the owner's words: "change the weapon and lance to the w key and then give 5 lances". `W` now throws instead of flapping (flap stays on `Space`/`↑`). The player carries 5 lances per life, collects thrown ones, and is unarmed only when holding none. C1, C2 and the README are updated to match. The headless smoke run was re-run and all 17 checks passed in 20 of 20 runs. Nobody has played it in a real browser yet.
