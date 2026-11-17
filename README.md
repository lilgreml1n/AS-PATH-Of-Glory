# AS-PATH OF GLORY

A momentum-based jousting arcade game in a single HTML file. You play a nerdy
network automation engineer riding a flying 1U switch, armed with a glowing
patch-cable lance, battling tech billionaires above a pit of lava.

**Play:** open `index.html` in any browser, or enable GitHub Pages for this repo.

## Getting started

### 1. Get the game

```sh
git clone https://github.com/lilgreml1n/AS-PATH-Of-Glory.git
cd AS-PATH-Of-Glory
```

No Git? On the GitHub page, click **Code → Download ZIP** and unzip it.

### 2. Play it

Double-click `index.html`, or drag it into a browser window. The whole game is in that one file. It needs no install, server or account. It loads its retro fonts from Google Fonts. Offline, it still plays but falls back to plain fonts.

Press any key, click or tap once to start the sound. The game shows controls on screen, and the full list is in [How to play](#how-to-play) below.

### 3. Change it (optional)

1. Edit `src/game.html`. That's the source. Don't edit `index.html` directly, because the build overwrites it.
2. Rebuild the playable file:
   ```sh
   ./build.sh
   ```
   The build needs `bash` and `sed`. On Windows, use Git Bash or WSL.
3. Reload `index.html` in the browser to try your change.
4. Commit both files so the online version updates:
   ```sh
   git add src/game.html index.html
   git commit -m "Describe your change"
   git push
   ```

Before changing gameplay, read [CONSTITUTION.md](CONSTITUTION.md). It lists the rules the game must keep, such as the higher lance winning. If you change a rule, update the README to match.

### 4. Put it online (optional)

Follow [Deploy to GitHub Pages](#deploy-to-github-pages) below. After a minute or two the game is live at **https://lilgreml1n.github.io/AS-PATH-Of-Glory/**. Share that link so people can play in their browser.

## How to play

| Action | Keyboard | Touch |
|---|---|---|
| Steer | `←` `→` or `A` `D` | ◀ ▶ buttons |
| Flap | `Space`, `↑`, `W` (tap it, don't hold) | FLAP button |
| Throw lance | `X` or `Shift` | THROW button |
| Pause | `P` / `Esc` | tap the screen |
| Mute | `M` | — |

## Rules

- **Higher lance wins.** When two riders collide, the one whose lance is higher wins. Equal height means both bounce off with a clang.
- **Inertia.** Steering accelerates you; reversing takes effort and you skid on the ground. Flying off one side wraps you to the other.
- **Dropped dies.** Defeated enemies drop a silicon die. Grab it (250 → 500 → 750 → 1000, +500 for a mid-air catch) before it reboots into a tougher enemy.
- **Lava.** From wave 4 the bridge melts. Fly too low and a molten hand grabs you; tap flap 7 times to break free.
- **Hype Wyvern.** Linger too long and it shows up. Only a lance in its open beak kills it.
- **Wave types.** Egg waves every 5th wave; survival waves (no deaths = 3000 bonus); an extra life every 20,000 points.

### Throwing your lance

Your patch-cable lance is also your one and only projectile. Throwing it is a gamble.

1. **Let it fly.** `X` or `Shift` hurls the lance straight ahead at lance height. It flies for about ¾ of a second, roughly half the screen, then drops. If it hits a platform, it thunks off and falls.
2. **You're UNPLUGGED.** Until you get it back, you have no lance. Touching any enemy or boss costs you a life, even if you're higher. Your name tag turns red and reads `YOU · UNPLUGGED`. You can still stomp rebooting dies and collect dies.
3. **Go get it.** A lance on the ground shows a bobbing `GRAB ME` tag. Touch it to plug back in.
4. **Daisy chain.** One throw goes through every minion in its path. The 1st scores normally, the 2nd double, the 3rd triple, and so on.
5. **Bullseye.** A thrown lance that hits a boss takes off one health bar (+500), same as a joust, then falls.
6. **Around the world.** If the lance flies off one edge and wraps around, every kill it makes after that adds +1000.
7. **Hot swap.** Catch your own lance before it lands for +250.
8. **Nothing but beak.** Throw it into the Hype Wyvern's open beak (facing it) for +1500.
9. **Lava eats lances.** If it falls into the lava, a replacement arrives in 5 seconds. Your tag counts down `RMA 5…4…`. You're unplugged until it arrives.

Losing a life always gives you a fresh lance.

### Who's who

Every rider has a colored name tag under them: you, each minion type, and each boss. The bar across the bottom of the screen lists everyone currently in the arena. A boss wave opens with flashing hazard stripes, a siren, and the announcer calling the boss by name, for example "Wave 3. Warning! Elon, the rocketeer, is entering the arena!"

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
| throw (whoosh) | you throw your lance |
| thunk | thrown lance hits a platform or a boss |
| siren | a boss wave starts |
| announcer | a boss wave starts: the boss's name and title, spoken by your browser's built-in text-to-speech voice. That's a generic system voice, not an imitation of anyone, and it's silent when muted or where the browser has no speech. |
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
