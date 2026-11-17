# AS-PATH OF GLORY

A momentum-based jousting arcade game in a single HTML file. You play a nerdy
network automation engineer riding a flying 1U switch, armed with a glowing
patch-cable lance, battling tech billionaires above a pit of lava.

**Play:** open `index.html` in any browser, or enable GitHub Pages for this repo.

## How to play

| Action | Keyboard | Touch |
|---|---|---|
| Steer | `←` `→` or `A` `D` | ◀ ▶ buttons |
| Flap | `Space`, `↑`, `W` (tap it, don't hold) | FLAP button |
| Pause | `P` / `Esc` | tap the screen |
| Mute | `M` | — |

## Rules

- **Higher lance wins.** When two riders collide, the one whose lance is higher wins. Equal height means both bounce off with a clang.
- **Inertia.** Steering accelerates you; reversing takes effort and you skid on the ground. Flying off one side wraps you to the other.
- **Dropped dies.** Defeated enemies drop a silicon die. Grab it (250 → 500 → 750 → 1000, +500 for a mid-air catch) before it reboots into a tougher enemy.
- **Lava.** From wave 4 the bridge melts. Fly too low and a molten hand grabs you; tap flap 7 times to break free.
- **Hype Wyvern.** Linger too long and it shows up. Only a lance in its open beak kills it.
- **Wave types.** Egg waves every 5th wave; survival waves (no deaths = 3000 bonus); an extra life every 20,000 points.

Details: two lances within 2.5 px count as a tie. Respawn protection lasts until you move or flap (max 4 s). Survival waves are 2, 7, 17, …; egg waves every 5th wave.

## Enemies and bosses

| Wave | Opponent | Gimmick |
|---|---|---|
| all | Scalper Bot (red) | drifts in sine waves |
| all | Crypto Miner (white) | climbs above you, then dives |
| all | Rival Silicon (blue) | fast, low, last-second lift |
| 3 | **Elon — The Rocketeer** | telegraphs, then rocket-dashes across the screen |
| 6 | **Bill — The Windows Wizard** | teleports in above you |
| 9 | **Jeff — The Prime Courier** | drops packages, calls in same-day backup |
| 12 | **Jensen — The Leather Jacket** (final boss) | overclocks and summons GPU minions |

Bosses alternate between chasing you from above and dipping low. Hit them from above while they're low. Beat Jensen to win; then keep going in endless mode with boss rematches every 4th wave.

## Sounds

All sounds are original 8-bit tones synthesized at run time with the Web Audio API (`tone` / `sfx` in `src/game.html`), so the code itself regenerates them. Audio starts on your first key press, click or tap; `M` mutes and the setting is saved. Every sound has a matching visual cue, so the game is fully playable muted.

| Sound | When |
|---|---|
| flap | each flap |
| clang | equal-height lance tie, boss hit, Wyvern kill |
| win | enemy defeated, walker stomped |
| egg (rising arpeggio) | die collected, pitch climbs with the chain |
| die | you lose a life |
| wave fanfare | wave starts |
| hatch | die reboots, Bill teleports, boss mounts up |
| wyvern | Hype Wyvern arrives, Elon dashes, Jensen overclocks |
| grab | lava hand grabs you |
| bump | ledge bounce, package THUD |
| life jingle | extra life, boss defeated, victory |

## Project layout

```
src/game.html   source (an HTML fragment, also publishable as a claude.ai Artifact)
build.sh        wraps src/game.html into a full HTML document
index.html      built, playable game (commit this so GitHub Pages can serve it)
```

Edit `src/game.html`, then run `./build.sh` to regenerate `index.html`.

Project rules live in [CONSTITUTION.md](CONSTITUTION.md), including what has and hasn't been verified yet. Unit tests (`node --test tests/`) are not written yet; see its *Current status* section.

## Deploy to GitHub Pages

Repo **Settings → Pages → Build and deployment → Deploy from a branch → `main` / root**.

## Disclaimer

A non-commercial parody made for fun. The characters are caricatures of public
figures; this project is not affiliated with or endorsed by any person or company
mentioned.
