# Curio 🧠

A TikTok-style vertical feed for learning, not doomscrolling. You swipe through short animated lessons on history, science, space, math, nature and tech, and puzzle minigames are mixed in as you go.

## Features

- **Swipeable feed.** Full-screen cards snap into place, like TikTok or Reels.
- **Micro-lessons.** Animated slide "videos" with story-style progress bars. Tap the left or right side to move between slides, tap the middle to pause, and double-tap to like. Each lesson has a **Learn more** sheet that cites its source.
- **Narration.** Turn on 🔊 to have lessons read aloud with the browser's built-in text-to-speech.
- **Puzzle minigames** mixed into the feed:
  - 🧠 Quick quiz
  - ⏳ Timeline: put historical events in order
  - 🔤 Word scramble
  - 🔢 Number patterns
  - 🃏 Memory match
  - 🧩 Sliding puzzle
- **Progress.** You earn XP for finishing lessons and solving puzzles, plus levels and a daily streak 🔥.
- **Personalised ranking, all local.** Topics you like show up more often, and things you've already finished move down the feed.
- **Explore.** Browse by topic or search everything.
- **Create.** Write your own lesson, one slide per line, with an optional emoji at the start of each line.
- **Like / Save / Share.** Share links deep-link straight to a card (`#l-cleopatra`).
- Keyboard controls on desktop: `↑`/`↓` or `j`/`k` to move through the feed, `space` to pause, `←`/`→` to change slides, `l` to like.

There's no account, no backend and no tracking. All progress is stored in `localStorage` on your device.

## Run it

It's plain HTML, CSS and ES modules with no build step and no dependencies.

```bash
npm start          # serves on http://localhost:5173 (python3 http.server)
# or any static server, e.g. npx serve .
```

ES modules don't load over `file://`, so you have to serve the folder rather than open `index.html` directly.

## Test

```bash
npm test           # node:test — feed ranking, puzzle rules, streaks, content checks
```

## Project layout

```
index.html          app shell (feed, explore, create, profile)
css/styles.css      styles (mobile-first, max 480px column on desktop)
js/app.js           UI: lesson player, puzzle cards, views
js/content.js       lessons + puzzles (add your own here)
js/feed.js          feed building / ranking
js/puzzles.js       pure puzzle, XP and streak logic
js/text.js          parses "Create" text into slides
js/store.js         localStorage persistence
test/               unit tests
```

## Adding content

Add entries to `LESSONS` or `PUZZLES` in `js/content.js`. A lesson is a list of `[emoji, text]` slides plus optional `more` and `source` fields. A puzzle has a `type` (`quiz`, `timeline`, `scramble`, `sequence`, `memory` or `slider`) and the fields its type uses; the existing entries show what each type needs. `npm test` checks that IDs are unique, topics are valid and every answer is among its options.
