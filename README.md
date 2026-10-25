# Curio 🧠

A TikTok-style vertical feed for learning, not doomscrolling. You swipe through short lessons and explainer videos on history, science, space, math, nature and tech, with puzzle minigames mixed in, plus a daily challenge. It installs on your phone as an app and works offline.

## Features

- **Swipeable feed.** Full-screen cards snap into place, like TikTok or Reels.
- **Explainer videos.** Short silent clips with captions burned in that autoplay, loop and can be scrubbed.
  - Moon phases
  - Pythagoras without algebra
  - Pendulum timing
  - 5,000 years of writing
- **Educational YouTube videos** from TED-Ed, CrashCourse, 3Blue1Brown, Veritasium, Numberphile and Kurzgesagt. They play in YouTube's privacy-enhanced embed player (`youtube-nocookie.com`), pause when you swipe away, and count as completed lessons when they finish.
- **Open-licensed videos** from Wikimedia Commons: public-domain NASA footage of the Apollo 11 landing site, the 2017 total solar eclipse and the Perseverance Mars landing. They stream from Commons, and the credit, license and a link to the source page are shown on each card. Landscape videos are letterboxed instead of cropped.
- **🎬 Videos feed.** A topic button that shows only videos.
- **Micro-lessons.** Animated slides with story-style progress bars. Tap the left or right side to move between slides and the middle to pause. Turn on 🔊 narration to have them read aloud with the browser's text-to-speech.
- **Puzzle minigames:**
  - 🧠 Quick quiz
  - ⏳ Timeline
  - 🔤 Word scramble
  - 🔢 Number patterns
  - 🃏 Memory match
  - 🧩 Sliding puzzle
- **📅 Daily challenge.** Three puzzles of different types each day, the same for everyone, picked from the date so no server is needed. Finishing all three earns a +50 XP bonus and extends your daily streak.
- **Progress.** XP, levels, an activity streak 🔥 and a daily-challenge streak.
- **Like / Save / Share.** Double-tap to like. Share links open straight to a card (e.g. `#v-moon-phases`).
- **Explore.** Browse by topic or search everything.
- **Create.** Publish your own lesson as **slides** or a **video**: upload a file from your device (stored in IndexedDB), paste a **YouTube link** (videos and Shorts), or paste a link to an `.mp4`/`.webm` file.
- **Installable app (PWA).** Use "Install" from the You tab, or Share → Add to Home Screen on iPhone. It works fully offline, including the bundled videos. The home-screen shortcuts jump straight to the Daily challenge or Puzzles.
- **Keyboard controls on desktop:**
  - `↑`/`↓` or `j`/`k`: next / previous card
  - `space`: pause
  - `←`/`→`: change slide, or seek 5 s in a video
  - `l`: like
  - `m`: sound on/off for videos

There's no account, no backend and no tracking. All progress stays on your device. YouTube and Wikimedia Commons are only contacted when you open one of their videos. Those videos need an internet connection; everything else works offline.

## Run it

It's plain HTML, CSS and ES modules with no build step and no runtime dependencies.

```bash
npm start          # http://localhost:5173 (small static server with HTTP Range support for video)
```

Any static host works, e.g. GitHub Pages or Netlify. Browsers only allow installing the app and offline mode over **HTTPS** or on `localhost`.

## Run it on your phone

**Quickest: same Wi-Fi.** Run `npm start` on your computer and open the "On your phone" address it prints (e.g. `http://192.168.1.20:5173`) in your phone's browser. Everything works except installing and offline mode, which need HTTPS.

**Install it as an app (HTTPS hosting).** Put the folder on any static host:

- **GitHub Pages** (needs a public repo or a paid plan for private repos): Settings → Pages → *Deploy from a branch* → pick the branch and `/ (root)` → Save. A minute later the app is at `https://<user>.github.io/<repo>/`.
- **Netlify Drop** (works with a private repo): download the repo as a ZIP, unzip it, and drag the folder onto <https://app.netlify.com/drop>. Sign in to keep the site permanently.

Then open the link on your phone and install it:

- **iPhone (Safari):** Share → *Add to Home Screen*.
- **Android (Chrome):** ⋮ menu → *Install app*, or use the 📲 button in Curio's **You** tab.

## Test

```bash
npm test           # unit tests: feed ranking, puzzle rules, streaks, daily picks, offline cache list, manifest
npm run smoke      # end-to-end in headless Chromium (needs Playwright + Chromium): videos, daily challenge,
                   # every puzzle type solved through the UI, video upload, offline mode
```

## Videos

The bundled clips in `media/clips/` are generated from code, so they're original and free to use. `tools/clips.js` draws each frame on a canvas, and `npm run clips` renders the frames and encodes them to H.264 MP4 with ffmpeg, along with a poster image for each clip. To add a clip:

1. Add a clip to `tools/clips.js`.
2. Run `npm run clips`.
3. Add an entry to `VIDEOS` in `js/content.js`.
4. List the new files in `sw.js` and bump its `VERSION`. `npm test` fails if you forget to list them.

Any other MP4/WebM URL can go in `VIDEOS` too. Vertical 9:16 video looks best.

YouTube videos go in `YOUTUBE`, with a `youtube` video ID, the channel as `creator`, and `short: true` for Shorts. Wikimedia Commons files go in `OPEN_VIDEOS`, using the `commons('File name.webm')` helper plus a `license` field. Check the file's license on its Commons page first, and prefer short clips under ~20 MB, because Commons streams the original file.

## Project layout

```
index.html            app shell (feed, explore, create, profile)
manifest.webmanifest  install metadata; sw.js = offline cache
css/styles.css        styles (mobile-first, 480px column on desktop, safe-area aware)
js/app.js             UI: lesson + video players, puzzle cards, daily challenge, views
js/content.js         lessons, videos (own clips, Commons, YouTube) and puzzles
js/feed.js            feed building / ranking
js/daily.js           daily challenge picks
js/puzzles.js         pure puzzle, XP and streak logic
js/media.js           IndexedDB storage for uploaded videos
js/text.js            parses "Create" text into slides; parses YouTube links
js/store.js           localStorage persistence
media/clips/          rendered explainer videos + posters
icons/                app icons (npm run icons)
tools/                clip/icon renderers, dev server, smoke test
test/                 unit tests
```

## Adding content

Add entries to `LESSONS`, `VIDEOS` or `PUZZLES` in `js/content.js`. Puzzle types are `quiz`, `timeline`, `scramble`, `sequence`, `memory` and `slider`; the existing entries show the fields each type needs. After changing any cached file, bump `VERSION` in `sw.js` so installed apps update.
