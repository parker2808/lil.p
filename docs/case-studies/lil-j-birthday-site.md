# Even the Stars Know Your Name

## Project overview

|         |                                                      |
| ------- | ---------------------------------------------------- |
| Role    | Solo developer and designer, Parker                  |
| Dates   | October 2026                                         |
| Live    | [https://lil-j.vercel.app](https://lil-j.vercel.app) |
| Contact | \<email\> · \<phone\>                                |

**Stack:** React 19, TypeScript, Vite 8, Framer Motion, a small WebGL galaxy with a canvas 2D fallback, canvas 2D for the other skies and games, Cloudinary image delivery, the platform audio element, Web Audio for the candles, Fontsource Inter, self-hosted Great Vibes, Vercel static hosting. Layout checks use Playwright Core against system Chrome. Lint is oxlint.

A private birthday site for J. Until midnight on 18 November 2026, Vietnam time (UTC+7), the public page is a countdown. After that instant it becomes a one-way story: a nickname gate, an opening sky, a birth-sky chart, a galaxy of photo eras, a quiz, a together-clock, a cake, a sealed note, pairs, scratch cards, daily “open when” letters, a short list of dreams, a yes/no question, a wish that turns into a star, and a final letter. Vietnamese and English come from one JSON file. English is the default. There is no account and no server. The page sends `noindex, nofollow`.

## What Parker built

The work landed in nine pull requests, all merged to `main`.

**[#1](https://github.com/parker2808/lil.j/pull/1) — Facebook photo downloader.** A Tampermonkey userscript and a DevTools fallback that, in a browser session already logged into Facebook, scroll a visible album, collect photo links, resolve a higher-resolution URL, and zip the files. An optional Node script compresses them to WebP at about 1200px. This tool gathered source photos. It is not part of the site runtime.

**[#2](https://github.com/parker2808/lil.j/pull/2) — The path.** The React app in `site/`: a single route through gate, sky, birth chart, photos, quiz, together-clock, cake, envelope, pairs, scratch cards, open-when letters, friend notes, dreams, the yes/no question, the wish, and the final letter. Next stays hidden until that step is done. Progress dots are not buttons. Back only returns to a step already opened. `?dev=1` adds a numbered jump row. Copy for the visit started in `content.json`. Placeholder art and a stand-in loop stood in for the real photos and music.

**[#3](https://github.com/parker2808/lil.j/pull/3) — Era planets and a flickable stack.** Photos grouped into eras. Opening an era flies into a tilted stack: a flick throws the top card, a tap flips it, a long-press opens the picture. Compliments arrive word by word. This pull request also added `npm run overlap`, the Playwright layout matrix.

**[#4](https://github.com/parker2808/lil.j/pull/4) — Spiral galaxy.** The planet map became a logarithmic spiral. Each era is a star cluster. A tap flies the camera in, then the same polaroid stack opens. The scene is WebGL1 (a disc plus additive points) and falls back to canvas 2D if the shaders do not start. Reduced motion freezes the spin and skips the fly-in.

**[#5](https://github.com/parker2808/lil.j/pull/5) — The rest of the copy.** Constellation names, the VI / EN labels, quiz marks, the tab title, and the last hard-coded visitor strings moved into `content.json`. The Vite build writes the English title and description into `index.html`, and the build fails if a translation, the unlock timestamp, an era, or a quiz answer is wrong.

**[#6](https://github.com/parker2808/lil.j/pull/6) — The real story and the real photos.** Placeholder drawings came out. Photo `src` values are Cloudinary public ids, delivered with `c_limit`, `f_auto`, and `q_auto` at the width the layout asks for. The bilingual copy for the visit is the finished text. The pairs game uses the first two photos of the eras that feed it.

**[#7](https://github.com/parker2808/lil.j/pull/7) — The birthday lock, and the playlist.** Before 00:00 on 18 November 2026, UTC+7, visitors see only the countdown. The instant is absolute, so the phone’s timezone cannot move it. At zero the countdown fades into the gate. `?dev=1` skips the lock and keeps the jump row. `?dev=1&lock=1` shows the countdown and keeps the jump row hidden until the real instant. The same pull request replaced the stand-in loop with the visit playlist (a random track per visit, no immediate repeat) and a birthday loop that crossfades in on the cake, and it set the letter signature in Great Vibes.

**[#8](https://github.com/parker2808/lil.j/pull/8) — iPhone 14 Pro Max.** Layout pass for 430×932 and for 430×739 with the browser toolbar open. Wide phones use a 59px top and 34px bottom safe area. The era stack and the pairs grid use the height they actually have, scratch-card titles draw at 18px, and a focused field on a phone scrolls the stage so the heading stays above the keyboard. The overlap matrix gained the 430×739 frame. Desktop scrollbars are a thin pink-lavender thumb. Mobile overlay scrollbars stay as the browser draws them.

**[#9](https://github.com/parker2808/lil.j/pull/9) — The blocked-music notice.** On iPhone the autoplay toast sat on the era title and never left. It now fades after three seconds, and it hides immediately when the music button is tapped or playback starts. A step change does not bring it back. A later tap can show it again only if `play()` fails again. After the toast, the “tap for music” label stays off. The button keeps a rounded pink-lavender ring until music is actually playing.

## Not merged yet

No feature work is waiting. [#1](https://github.com/parker2808/lil.j/pull/1) through [#9](https://github.com/parker2808/lil.j/pull/9) are merged to `main`. The remote `cursor/*` branches are the pre-squash histories of those same pull requests.

## Not Parker's

**Libraries and hosts.** React, React DOM, Vite, TypeScript, Framer Motion, oxlint, Playwright Core, and Fontsource are dependencies. The photo downloader zips with JSZip from a CDN and can compress with sharp. Images are delivered by Cloudinary. The site is hosted on Vercel. Parker wrote the app, the shaders, the star chart, the overlap harness, and the userscript around those tools.

**Music.** The files in `site/public/music/` are recordings Parker did not write or perform. Laufey: “From The Start”, “Bewitched”, “Valentine”. beabadoobee: “Glue Song”. Also on the playlist: “Echoes of the Stars” (sleepvolume), “Twinkle Twinkle Little Star (Grand Piano)”, and “Happy Birthday Music Box Loop”. Parker chose the order and the playback behavior.

**Fonts.** Inter ships through Fontsource (Latin and Vietnamese). Great Vibes is the SIL Open Font License face in `site/public/fonts`, from The Great Vibes Project. Parker did not design either face.

**Galaxy references.** The spiral’s density, arm shape, and additive points follow public WebGL and three.js galaxy studies (an 80k-particle spiral, Bruno Simon’s galaxy lesson, and a few point-sprite demos). Those projects are not in this repo. The shader in `site/src/lib/galaxy-gl.ts` is code written for this site.

**Assistance.** The implementation was written with Cursor’s AI coding agents, under Parker’s direction and review. The merged commits are co-authored by Cursor Agent. The product decisions, the copy in `content.json`, and what shipped are Parker’s.

## Challenges and solutions

**The page had to stay a surprise.** A client-side countdown is the whole public site until the birthday instant. It reads one ISO timestamp with a `+07:00` offset, so a phone set to another zone still unlocks at Vietnam midnight. `?dev=1` is how the later steps were reviewed without publishing them early. The nickname that opens the gate lives in the content file in plain text. That is a keepsake for J, and it is not an access-control system. `noindex, nofollow` is the other half of keeping the URL quiet.

**A long story had to fit a phone whose chrome moves.** 430×932 and 430×739 are different pages. The header grows when a hint is showing, and the footer is a fixed band. Header and footer heights are measured into CSS variables. On a phone, focusing the gate or the wish field scrolls the stage, not the window, so the heading and the field stay above the keyboard. [#8](https://github.com/parker2808/lil.j/pull/8) is that pass. `npm run overlap` then walks every step in Vietnamese and English, finished and unfinished, with the dev row on and off, from a 320px phone through tablet sizes to a desktop, including those two iPhone frames and an 80px toolbar. The command fails on a collision, a clipped line, or sideways overflow.

**Autoplay is a refusal.** The first visit stays muted. If `play()` rejects, a toast explains it and then leaves, on a timer or on the tap that can actually start audio. [#9](https://github.com/parker2808/lil.j/pull/9) stopped that toast covering the era title for the rest of the visit. The lasting cue is the ring on the music button, and the ring goes away when audio is playing. The cake can still crossfade to the birthday loop after a successful start.

**Two languages in one tree.** Visitor copy is `{ vi, en }` in `site/content.json`. The production build rejects a missing side. [#5](https://github.com/parker2808/lil.j/pull/5) pulled the last strings out of the components so a wording change does not require a component edit. The language key is separate from story progress.

**A sky without a graphics framework or an astronomy API.** The galaxy is two shaders and a camera. If WebGL is missing, the same canvas uses the 2D context. The birth sky projects a bright-star J2000 list from the time and place stored in the content file. Precession is left out, so the chart is a portrait of that afternoon. Reduced motion holds the canvases still and shows every word at once. Candles listen for a breath and also go out on a tap.

**Progress without an account.** One `localStorage` record remembers the step and what she has already done. When the path gained and lost a chapter, the save kept a flow version and was remapped by step name, so an old visit does not reopen on the wrong screen.

## Results

- Live at [https://lil-j.vercel.app](https://lil-j.vercel.app). Before the birthday instant the public page is the countdown.
- The shipped visit is a 15-step path on a phone. Next waits for the step to be finished. A refresh resumes from the device.
- Vietnamese and English ship from `site/content.json`. `npm run build` is also the copy check.
- Photos, the playlist, the birth instant, and the unlock instant change in that file.
- [#8](https://github.com/parker2808/lil.j/pull/8) and [#9](https://github.com/parker2808/lil.j/pull/9) each closed with the overlap suite at 2880 cases and 0 failures, covering phones, tablets, and desktops in both languages.
- Music, motion, and the candle mic each have a direct fallback: a ring instead of a stuck banner, still text instead of a reveal, a tap instead of a breath.

---

# Appendix: README

# Even the Stars Know Your Name

A private birthday website for J. It stays behind a countdown until midnight on 18 November 2026, Vietnam time (UTC+7), then opens into a one-way story: a birth sky, a galaxy of photo eras, a few small games, and a letter at the end.

**Live:** [https://lil-j.vercel.app](https://lil-j.vercel.app)

The Vietnamese title is _Đến những vì sao cũng biết tên em_. English is the default language. A VI / EN switch in the header changes every line.

## The idea

The page is a gift, not a product with accounts. Before the birthday it shows only a countdown. After midnight it asks for a nickname, then walks through the story one step at a time. Nothing in the path is a menu. You move forward when the moment is finished, and you can step back only as far as you have already opened.

The visit, in order:

1. **Countdown.** Days, hours, minutes, and seconds until the unlock instant.
2. **Gate.** A nickname. The right answer continues on its own.
3. **Sky.** Stars light up and join into a heart, then a name appears in the middle.
4. **Birth sky.** The bright stars as they stood on the afternoon she was born, drawn in the browser from the time and place in `content.json`. Tap a constellation to read its name.
5. **Galaxy.** Photo eras arranged as a spiral. Open an era and the pictures become a stack of cards you can flip.
6. **Quiz.**
7. **Together-clock.** Time since a date stored in the same file.
8. **Cake.** Candles go out from a breath on the microphone, or from a tap. A short letter types itself out. The playlist crossfades to a birthday loop.
9. **Envelope.** A wax seal opens a note.
10. **Pairs.** A memory game made from the first two photos of each era.
11. **Scratch cards.** A foil layer reveals a line underneath.
12. **Open when…** Letters you can open once each day, on the phone’s own calendar, then they seal again until tomorrow.
13. **Dreams.** Tick at least one.
14. **The question.** The “no” button slips away. “Yes” is what opens the next step.
15. **Wish.** A sentence leaves the field and becomes a star. It is still there if you come back.
16. **Final letter.** The lines arrive in turn, and the music fades down. You can read it again. There is no step after this.

Friend notes still live in the content file and have a screen in the repo. They are off this path until `INCLUDE_FRIENDS` in `site/src/lib/flow.ts` is turned on.

## Product decisions

**Mobile first, checked on an iPhone 14 Pro Max.** The layout is tuned for 430×932, and for 430×739 when the browser toolbar is open. Wide phones use a 59px top and 34px bottom safe area. The header and footer heights are measured into the page so the story sits between them. On a phone, focusing the gate or the wish field scrolls the stage so the heading and the field stay above the keyboard. Desktop windows leave that behavior alone.

**Words arrive one at a time.** Headings use a small mask animation, one word after another. Compliments on the photo cards and the final letter use the same rhythm. The cake letter is a typewriter, character by character. `prefers-reduced-motion` skips the choreography and shows the text at once. The same preference stops the galaxy spin, the fireworks, and the other canvas loops.

**Next waits.** The footer button stays hidden until that step is actually done: an era opened, every quiz answer chosen, every candle out, the pairs finished, the foil cleared, a wish sent, “yes” pressed. The gate moves forward by itself. The last letter has no Next. Progress dots are not buttons. Back returns only to a step already unlocked.

**Both languages come from one file.** Visitor-facing copy is a pair:

```json
{ "vi": "Câu tiếng Việt", "en": "The English line" }
```

The build fails if either side is missing. The language choice is stored on its own (`lilj.locale.v1`) and survives a progress reset. English is the default when nothing has been chosen.

**Music is a playlist, and autoplay is allowed to fail.** Each visit picks a track at random. When a song ends, the next one is a different track whenever there is a choice. The first visit stays quiet, because a browser will refuse `play()` with no gesture. If playback is blocked, a short note explains it, fades after three seconds, and also disappears if the music button is tapped or audio actually starts. It does not return on every step. After that note, the text hint stays away and the music button keeps a soft pink-lavender ring until music is playing.

**The gate is a keepsake.** The nickname sits in `content.json` in plain text. Anyone who can read the repository can see it. The page also sends `noindex, nofollow`, so the privacy is social, not cryptographic. There is no account and no server.

## Stack

Versions are the ones in [`site/package.json`](site/package.json).

| Piece                        | Where it shows up                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| React 19 and React DOM       | The whole interface.                                                                                                  |
| Vite 8                       | Dev server, production build, and the HTML title pulled from `content.json`.                                          |
| TypeScript                   | Application code, checked by `tsc -b` before each production build.                                                   |
| Framer Motion                | Step transitions, word reveals, the sticky Next button, countdown reels.                                              |
| WebGL                        | The photo galaxy in `site/src/lib/galaxy-gl.ts`. If the context is missing, the same canvas draws with the 2D API.    |
| Canvas 2D                    | Birth sky, wish sky, starfield, fireworks, scratch foil, and the cake.                                                |
| Cloudinary                   | Photo `src` values are public ids. Delivery URLs add `c_limit`, `f_auto`, and `q_auto` at the width the layout needs. |
| Web Audio and `getUserMedia` | Blowing out the candles. A tap does the same job when the mic is unavailable.                                         |
| `HTMLAudioElement`           | The playlist, the crossfade, and the birthday loop. No audio library.                                                 |
| Fontsource Inter             | Latin and Vietnamese, weights 400–700, bundled with the app.                                                          |
| Great Vibes                  | Self-hosted from `site/public/fonts` (SIL Open Font License) for the signature.                                       |
| Vercel                       | Static deploy of `site/dist`, with an SPA rewrite to `index.html`.                                                    |
| oxlint                       | `npm run lint`.                                                                                                       |
| Playwright Core              | The overlap suite drives the Chrome already installed on the machine.                                                 |

There is no database, no API, and no UI kit. Progress and language live in `localStorage`.

## Project structure

```
vercel.json                 repo-root deploy: install and build inside site/
site/
  content.json              every line, photo id, track, and date
  index.html                viewport, noindex, font preload
  package.json
  vercel.json               same SPA rewrite when the Vercel root is site/
  vite.config.ts
  public/
    fonts/                  Great Vibes
    music/                  playlist files
  scripts/
    overlap-check.mjs       layout matrix
    selfcheck.mjs           small assertions for the pure helpers
    make-placeholders.mjs   stand-in art; the live photos are Cloudinary ids
  src/
    App.tsx                 the path, the lock, the music notice
    main.tsx
    styles.css
    content.ts              loads JSON, flattens photos, validates
    types.ts
    components/             gate, sky, cake, letter, galaxy, lock screen
    chapters/               gallery, quiz, pairs, scratch, dreams, clock
    lib/                    flow, i18n, music, stars, images, progress, viewport
tools/fb-photo-downloader/  optional local helper for saving photos
```

## Run, build, test

Vite 8 needs Node `^20.19.0` or `>=22.12.0`.

```bash
cd site
npm install
npm run dev
```

Open the URL Vite prints. On a phone on the same network, or in a narrow desktop window, you are looking at the layout the page is built for.

```bash
npm run build      # tsc -b && vite build
npm run preview    # serve site/dist
npm run lint       # oxlint
node scripts/selfcheck.mjs
npm run overlap    # production build, then the layout matrix
```

`npm run overlap` needs Chrome (`google-chrome`, `google-chrome-stable`, `chromium`, or `CHROME_PATH`). It walks every step in Vietnamese and English, with the dev jump row on and off, and with each step both finished and still waiting. Viewports run from a 320px phone through iPad sizes to a 1920×1080 desktop, including 430×932 and the shorter 430×739 iPhone 14 Pro Max frame, plus a phone toolbar that steals 80px of height. The command fails if text or controls collide with the header or footer, if a line is clipped, or if the page overflows sideways.

Useful limits, all optional: `OVERLAP_VIEWPORTS`, `OVERLAP_LOCALES`, `OVERLAP_STEPS`, `OVERLAP_DEV`, `OVERLAP_STATES`, `OVERLAP_URL`.

Deploy is a static Vite build. From this repository, the root [`vercel.json`](vercel.json) installs and builds inside `site/` and publishes `site/dist`. Pointing a Vercel project at `site/` also works. `site/vercel.json` sets the framework to Vite and repeats the SPA fallback. The microphone needs HTTPS, which the Vercel URL has. `localhost` is fine too.

## `?dev=1`

Add `?dev=1` to skip the countdown and to show a numbered row in the header. Each number jumps straight to that step. The × at the end clears saved progress and reloads. The flag is read from the query string only. It is not written to `localStorage`.

`?dev=1&lock=1` keeps the countdown up before the birthday. The jump row stays hidden until the real unlock instant, so the lock can be reviewed on its own.

Saved progress is `lilj.progress.v1`: the current step, the furthest step unlocked, and the flags for everything the visitor has already done. An older save is mapped onto the current path by step name. Deleting the key starts the story over and leaves the language choice alone.

## Editing the story

Change [`site/content.json`](site/content.json), then refresh the dev server or rebuild. Components read that file. They do not hold the copy.

Both languages are required on anything a visitor reads. A few fields stay plain strings or numbers: ids, `src`, `startDate`, `lock.unlockAt`, `birth.when`, `birth.lat`, `birth.lon`, music titles, the gate answer, and the short names in `meta`. `npm run build` reports a missing translation, a bad unlock timestamp, an empty era, or a quiz answer that does not point at an option.

Photos are Cloudinary public ids, for example `lilj/care/01_name`. The page builds the delivery URL. Image files do not belong in the repo. The first two photos of each era are the pairs used by the memory game.

`lock.unlockAt` has to be an ISO timestamp with a `+07:00` offset. The countdown uses that instant as an absolute time, so the phone’s timezone does not move the birthday.

Music files go in `site/public/music/` and are listed under `music.tracks`. `music.birthday` is the loop the cake fades in. Paths start with `/music/`.
