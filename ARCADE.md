---
arcade_version: 1

game:
  title: "AS-PATH Of Glory"
  slug: as-path-of-glory
  tagline: "Joust tech billionaires above a lava pit, riding a flying 1U switch."
  summary: "You are a network automation engineer on a flying switch with a patch-cable lance, jousting minions and four parody tech-billionaire bosses. Higher lance wins; throw your 5 lances and grab them back. It is a fun arcade game with networking jokes, not a networking lesson."
  topics: [network automation, networking humor, arcade, jousting]
  category: other
  skill_level: beginner
  play_minutes: unknown
  levels: 12
  card_image: assets/card.webp
  card_image_alt: "Title screen: AS-PATH OF GLORY in glowing cyan above the engineer on a flying switch and the four bosses Elon, Bill, Jeff and Jensen."
  repo: https://github.com/lilgreml1n/AS-PATH-Of-Glory
  repo_path: ""
  license: MIT

creator:
  name: lilgreml1n
  github: lilgreml1n
  location: ""
  organization: ""
  links: []
  first_spec_project: true
  workshop: "NAF AC6"
  consent_to_publish: true

build:
  started: "2026-11-17"
  finished: "2026-11-17"
  wall_time: unknown
  spec_driven:
    framework: custom
    framework_version: unknown
    artifacts: [constitution]
    task_count: 0
    loops_or_phases: 0
  model: claude-opus-5-5
  helper_models: []
  harness: Claude Code
  harness_version: "2.1.326"
  mcp_servers: ["claude.ai Claude Docs (connected, not used)", "Gmail (connected, not used)", "Google Calendar (connected, not used)", "Google Drive (connected, not used)", "easel (connected, not used)", "earlier build session: unknown"]
  rag_and_sources: []
  skills_and_plugins: []
  other_tools: [GitHub CLI (gh), Node.js headless smoke test, bash build script, Firefox headless screenshot, Python Pillow (card image crop)]
  human_prompts: unknown
  usage:
    input_tokens: unknown
    output_tokens: unknown
    cost_note: "unknown"
  ai_generated_assets: ["code: Claude (claude-opus-5-5)", "graphics: drawn by code on canvas, no image files", "audio: synthesized at run time by code; announcer uses the browser's built-in text-to-speech"]

runtime:
  kind: static-web
  stack: [HTML, CSS, JavaScript, Canvas 2D, Web Audio API, Web Speech API]
  start: "open index.html in a browser"
  url_after_start: ""
  hosted_url: https://lilgreml1n.github.io/AS-PATH-Of-Glory/
  static_root: "."
  requires_install: false
  requires_network: false
  requires_api_key: false
  uses_ai_at_runtime: false
  browsers: ["Firefox 160 (headless, title screen only)"]
  accessibility: "Keyboard and touch controls, reduced-motion handling and text labels are implemented, but the keyboard-only, narrow-window and reduced-motion checks have not been run."
  save_state: "browser localStorage (high score and mute setting)"

verification:
  tests: "none committed; a headless Node smoke test was run during the build but is not in the repo"
  tests_passing: 0
  facts_sourced_from: []
  known_limits:
    - "Does not teach BGP or any networking skill; networking appears only as theme and jokes."
    - "No committed unit tests yet (constitution C9 not met)."
    - "No recorded real-browser playthrough; only a title-screen load in headless Firefox and a stubbed-browser smoke test."
    - "Retro fonts load from Google Fonts; offline it falls back to plain fonts."
    - "The boss announcer needs browser speech support; without it the on-screen banner still shows."
    - "Bosses are good-natured parodies of public figures; not affiliated with or endorsed by anyone depicted."
---

## In one paragraph

AS-PATH Of Glory is a momentum-based jousting arcade game in a single HTML file. You ride a flying 1U switch with a glowing patch-cable lance over a pit of lava. Your opponents are scalper bots, crypto miners and four parody bosses: Elon, Bill, Jeff and, as the final boss, Jensen. Hit them with a higher lance, or throw one of your five lances and fly back to collect it. It's for network engineers who want a few minutes of silly fun. It isn't a lesson.

## How it was built

The repository started empty. The first constitution came from the NAF AC6 StarterKit and described a BGP AS_PATH teaching game. In a separate Claude Code session the owner changed direction to an arcade jouster, and the constitution was amended with the reason logged. That session is not recorded here beyond its commit message. Later requests followed one at a time:

1. Clearer characters, which became name tags and a roster bar.
2. A lance throw with fun rules.
3. Spoken announcements for boss waves.
4. Throwing on W with five lances.

Each change came with a constitution amendment and a README update, because the original rules said "no projectiles that kill". The build machine had no browser automation. We wrote a Node script that stubs the browser and runs the real game code, with 17 checks covering throwing, pickup, chains, lava returns, unarmed deaths and the announcer lines. Its early failures were mistakes in the test setup, such as placing the player inside a platform or random enemies killing an unarmed player. Resetting to an empty wave before each check fixed them. Nobody has recorded a real-browser playthrough.

## What we'd tell the next builder

- Change the constitution before the code. Ours banned projectiles, so the lance throw needed a logged amendment first.
- A small script that stubs the browser and runs the real game code catches logic bugs fast. Commit it as `node --test` tests instead of leaving it on your machine.
- Firefox installed as a snap can't read `/tmp`. Put headless screenshot output under your home folder.
