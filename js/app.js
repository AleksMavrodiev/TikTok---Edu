import { TOPICS, LESSONS, PUZZLES } from './content.js';
import { buildFeed, mulberry32, shuffle } from './feed.js';
import * as P from './puzzles.js';
import { load, save } from './store.js';
import { parseSlides } from './text.js';

// ---------- helpers ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k.startsWith('--')) el.style.setProperty(k, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : String(c));
  return el;
}

const state = load();
const persist = () => save(state);
const topicById = (id) => TOPICS.find((t) => t.id === id) || TOPICS[0];
const allLessons = () => [...state.custom, ...LESSONS];
const allItems = () => [...allLessons(), ...PUZZLES];
const findItem = (id) => allItems().find((it) => it.id === id);
const today = () => new Date().toLocaleDateString('en-CA');
const toggleIn = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

function award(kind, id) {
  const list = kind === 'lesson' ? 'completed' : 'solved';
  if (state[list].includes(id)) return false;
  const before = P.levelFor(state.xp).level;
  state[list].push(id);
  state.xp += P.XP[kind];
  state.streak = P.nextStreak(state.streak, today());
  persist();
  const after = P.levelFor(state.xp).level;
  toast(after > before ? `🎉 Level ${after}!` : `+${P.XP[kind]} XP`);
  return true;
}

// ---------- narration ----------
const canSpeak = 'speechSynthesis' in window;
function speak(text, done) {
  if (!canSpeak || !state.narration) return done();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.02;
  u.onend = u.onerror = done;
  speechSynthesis.speak(u);
}
function stopSpeech() { if (canSpeak) speechSynthesis.cancel(); }

function setNarration(on) {
  state.narration = on && canSpeak;
  persist();
  $('#narrationBtn').textContent = state.narration ? '🔊' : '🔇';
  $('#narrationBtn').setAttribute('aria-pressed', String(state.narration));
  $('#narrationToggle').checked = state.narration;
  if (!state.narration) stopSpeech();
}

// ---------- lesson player ----------
class LessonPlayer {
  constructor(card, lesson) {
    this.card = card;
    this.lesson = lesson;
    this.i = 0;
    this.elapsed = 0;
    this.playing = false;
    this.done = false;
    this.spoken = true;
    this.token = 0;
    this.stage = $('.stage', card);
    this.bars = $$('.progress i', card);
  }
  duration(i) {
    const len = this.lesson.slides[i][1].length;
    return Math.min(9000, Math.max(3500, 2400 + len * 55));
  }
  show(i) {
    this.i = i;
    this.elapsed = 0;
    const [emoji, text] = this.lesson.slides[i];
    this.stage.replaceChildren(
      h('div', { class: 'slide-in' }, h('div', { class: 'slide-emoji', 'aria-hidden': 'true' }, emoji), h('div', { class: 'slide-text' }, text)),
    );
    this.card.style.setProperty('--angle', `${150 + i * 25}deg`);
    this.bars.forEach((b, j) => { b.style.width = j < i ? '100%' : '0%'; });
    const token = ++this.token;
    this.spoken = !state.narration;
    if (this.playing) speak(text, () => { if (token === this.token) this.spoken = true; });
  }
  play() {
    if (this.done || this.playing) return;
    this.playing = true;
    this.card.classList.remove('user-paused');
    $('.paused-badge', this.card)?.remove();
    if (!this.started) { this.started = true; this.show(0); }
    else if (state.narration && !this.spoken) this.show(this.i); // restart narration for this slide
    this.last = performance.now();
    const loop = (now) => {
      if (!this.playing) return;
      this.elapsed += now - this.last;
      this.last = now;
      const dur = this.duration(this.i);
      this.bars[this.i].style.width = `${Math.min(100, (this.elapsed / dur) * 100)}%`;
      // Wait for narration to finish, but never hang if speech misbehaves.
      if (this.elapsed >= dur && (this.spoken || !state.narration || this.elapsed > dur * 3)) this.next();
      if (this.playing) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  pause(byUser = false) {
    if (!this.playing) return;
    this.playing = false;
    cancelAnimationFrame(this.raf);
    this.token++;
    stopSpeech();
    if (byUser) {
      this.card.classList.add('user-paused');
      this.card.append(h('div', { class: 'paused-badge', 'aria-hidden': 'true' }, '▶️'));
    }
  }
  toggle() { this.playing ? this.pause(true) : this.play(); }
  next() { this.i < this.lesson.slides.length - 1 ? this.show(this.i + 1) : this.finish(); }
  prev() { this.show(Math.max(0, this.i - 1)); }
  finish() {
    this.pause();
    this.done = true;
    this.bars.forEach((b) => { b.style.width = '100%'; });
    const fresh = award('lesson', this.lesson.id);
    this.card.append(h('div', { class: 'end' },
      h('div', { style: { fontSize: '56px' } }, '✅'),
      h('h3', {}, fresh ? `Lesson complete · +${P.XP.lesson} XP` : 'Lesson complete'),
      h('p', { class: 'muted', style: { margin: 0 } }, 'Swipe up for the next one'),
      h('div', { class: 'row-btns' },
        h('button', { class: 'btn', onclick: () => this.replay() }, '↻ Replay'),
        h('button', { class: 'btn', onclick: () => openMore(this.lesson) }, '📖 Learn more'),
        h('button', { class: 'btn primary', onclick: () => scrollFeed(1) }, 'Next ↓'),
      ),
    ));
  }
  replay() {
    $('.end', this.card)?.remove();
    this.done = false;
    this.show(0);
    this.play();
  }
}

// ---------- shared card parts ----------
function actionBar(item) {
  const btn = (cls, icon, label, onclick, pressed) =>
    h('button', { class: `act ${cls}`, 'aria-pressed': pressed == null ? null : String(pressed), [`data-${cls}`]: item.id, onclick }, h('b', {}, icon), label);
  return h('div', { class: 'actions' },
    btn('like', '❤', 'Like', () => toggleLike(item.id), state.liked.includes(item.id)),
    btn('save', '🔖', 'Save', () => toggleSave(item.id), state.saved.includes(item.id)),
    btn('share', '↗', 'Share', () => share(item)),
    item.slides ? btn('info', 'ℹ', 'More', () => openMore(item)) : null,
  );
}

function toggleLike(id, force) {
  const on = force ?? !state.liked.includes(id);
  if (on !== state.liked.includes(id)) state.liked = toggleIn(state.liked, id);
  persist();
  $$(`[data-like="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
}
function toggleSave(id) {
  state.saved = toggleIn(state.saved, id);
  persist();
  const on = state.saved.includes(id);
  $$(`[data-save="${CSS.escape(id)}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
  toast(on ? 'Saved to your profile' : 'Removed from saved');
}
async function share(item) {
  const url = `${location.origin}${location.pathname}#${item.id}`;
  try {
    if (navigator.share) await navigator.share({ title: item.title, text: `${item.title} — on Curio`, url });
    else { await navigator.clipboard.writeText(url); toast('Link copied'); }
  } catch { /* cancelled */ }
}

function openSheet(...content) {
  const sheet = $('#sheet');
  $('.sheet-body', sheet).replaceChildren(...content);
  sheet.hidden = false;
  activePlayer()?.pause();
}
function closeSheet() {
  $('#sheet').hidden = true;
  if (currentView === 'feed') resumeActive();
}
function openMore(lesson) {
  openSheet(
    h('h3', {}, lesson.title),
    h('p', {}, lesson.more || 'No extra notes for this one.'),
    lesson.source ? h('p', { class: 'muted' }, `Source: ${lesson.source}`) : null,
    h('button', { class: 'btn', onclick: closeSheet }, 'Close'),
  );
}

function heartBurst(card, x, y) {
  const r = card.getBoundingClientRect();
  const el = h('div', { class: 'heart-burst', style: { left: `${x - r.left}px`, top: `${y - r.top}px` } }, '❤️');
  card.append(el);
  setTimeout(() => el.remove(), 800);
}

// ---------- lesson card ----------
function renderLesson(lesson) {
  const t = topicById(lesson.topic);
  const card = h('article', { class: 'card lesson', 'data-id': lesson.id, '--c1': t.colors[0], '--c2': t.colors[1], 'aria-label': lesson.title },
    h('div', { class: 'progress', 'aria-hidden': 'true' }, lesson.slides.map(() => h('span', {}, h('i')))),
    h('div', { class: 'stage' },
      h('div', { class: 'slide-emoji' }, lesson.slides[0][0]),
      h('div', { class: 'slide-text' }, lesson.title)),
    h('div', { class: 'meta' },
      h('span', { class: 'tag' }, `${t.icon} ${t.name}`),
      h('h2', {}, lesson.title),
      h('p', { class: 'by' }, `@${lesson.creator} · ${lesson.slides.length} slides`)),
    actionBar(lesson),
  );
  const player = new LessonPlayer(card, lesson);
  card._player = player;

  // Tap left/right third = prev/next slide, middle = pause. Double tap = like.
  let tapTimer = null;
  $('.stage', card).addEventListener('click', (e) => {
    if (player.done) return;
    if (tapTimer) {
      clearTimeout(tapTimer);
      tapTimer = null;
      toggleLike(lesson.id, true);
      heartBurst(card, e.clientX, e.clientY);
      return;
    }
    tapTimer = setTimeout(() => {
      tapTimer = null;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (x < 0.3) { player.prev(); player.play(); }
      else if (x > 0.7) { player.next(); if (!player.done) player.play(); }
      else player.toggle();
    }, 260);
  });
  return card;
}

// ---------- puzzle cards ----------
const PUZZLE_KIND = {
  quiz: '🧠 Quick quiz', sequence: '🔢 Number pattern', scramble: '🔤 Word scramble',
  timeline: '⏳ Timeline', memory: '🃏 Memory match', slider: '🧩 Sliding puzzle',
};

function renderPuzzle(p) {
  const t = topicById(p.topic);
  const body = h('div', { class: 'pz' });
  const card = h('article', { class: 'card puzzle', 'data-id': p.id, '--c1': t.colors[0], '--c2': '#111827', '--angle': '170deg', 'aria-label': p.title },
    body, actionBar(p));

  const solved = () => {
    const fresh = award('puzzle', p.id);
    body.append(h('div', { class: 'solved-badge' }, fresh ? `✓ Solved · +${P.XP.puzzle} XP` : '✓ Solved'),
      h('button', { class: 'btn', style: { alignSelf: 'flex-start' }, onclick: draw }, '↻ Play again'));
  };
  function draw() {
    body.replaceChildren(
      h('div', { class: 'pz-kind' }, `${PUZZLE_KIND[p.type]} · ${t.name}`),
      h('h2', {}, p.title),
      ...BUILDERS[p.type](p, solved, draw),
    );
  }
  draw();
  return card;
}

function choiceQuestion(options, answer, explain, solved, reset) {
  const wrap = h('div');
  const status = h('p', { class: 'status' });
  const btns = options.map((o, i) => h('button', {
    class: 'opt',
    onclick: () => {
      btns.forEach((b) => { b.disabled = true; });
      btns[answer].classList.add('right');
      if (i === answer) {
        status.textContent = 'Correct!';
        status.className = 'status good';
        if (explain) wrap.append(h('p', { class: 'explain' }, explain));
        solved();
      } else {
        btns[i].classList.add('wrong');
        status.textContent = 'Not quite.';
        if (explain) wrap.append(h('p', { class: 'explain' }, explain));
        wrap.append(h('button', { class: 'btn', style: { marginTop: '10px' }, onclick: reset }, 'Try again'));
      }
    },
  }, String(o)));
  wrap.append(...btns, status);
  return wrap;
}

const BUILDERS = {
  quiz(p, solved, redraw) {
    return [choiceQuestion(p.options, p.answer, p.explain, solved, redraw)];
  },

  sequence(p, solved, redraw) {
    return [
      h('div', { class: 'seq' }, p.numbers.map((n) => h('span', {}, n)), h('span', { class: 'q' }, '?')),
      choiceQuestion(p.options, p.options.indexOf(p.answer), p.explain, solved, redraw),
    ];
  },

  scramble(p, solved) {
    const pool = h('div', { class: 'tiles' });
    const answer = h('div', { class: 'tiles answer', 'aria-label': 'Your answer' });
    const status = h('p', { class: 'status' });
    let letters = P.scrambleWord(p.word);
    let picked = []; // indices into letters
    let done = false;
    const render = () => {
      pool.replaceChildren(...letters.map((ch, i) => (picked.includes(i) ? null : h('button', { class: 'tile', onclick: () => pick(i) }, ch))));
      answer.replaceChildren(...picked.map((i, k) => h('button', { class: 'tile', onclick: () => unpick(k) }, letters[i])));
    };
    const pick = (i) => {
      if (done) return;
      picked.push(i);
      render();
      if (picked.length === letters.length) {
        const guess = picked.map((j) => letters[j]).join('');
        if (guess === p.word) {
          done = true;
          status.textContent = `${p.word} — correct!`;
          status.className = 'status good';
          solved();
        } else {
          status.textContent = 'Not quite — try again';
          answer.classList.add('shake');
          setTimeout(() => { answer.classList.remove('shake'); picked = []; render(); }, 600);
        }
      }
    };
    const unpick = (k) => { if (!done) { picked.splice(k, 1); render(); } };
    render();
    return [
      h('p', { class: 'hint' }, `Hint: ${p.hint} (${p.word.length} letters)`),
      answer, pool, status,
      h('button', { class: 'btn', style: { alignSelf: 'flex-start' }, onclick: () => { if (!done) { letters = P.scrambleWord(p.word); picked = []; render(); } } }, '🔀 Shuffle'),
    ];
  },

  timeline(p, solved) {
    const order = shuffle(p.events.map((_, i) => i));
    const picked = [];
    const status = h('p', { class: 'status' }, 'Tap the oldest event first.');
    const list = h('div');
    const render = (revealYears = false) => {
      const shown = [...picked, ...order.filter((i) => !picked.includes(i))];
      list.replaceChildren(...shown.map((i) => {
        const pos = picked.indexOf(i);
        return h('button', {
          class: `opt${pos >= 0 ? ' right' : ''}`, disabled: pos >= 0 || revealYears,
          onclick: (e) => {
            picked.push(i);
            if (P.firstTimelineError(p.events, picked) !== -1) {
              picked.pop();
              e.currentTarget.classList.add('wrong', 'shake');
              status.textContent = 'Not yet — something happened before that.';
              setTimeout(() => render(), 500);
              return;
            }
            status.textContent = picked.length < p.events.length ? 'Good! What happened next?' : 'Perfect order!';
            const complete = P.isChronological(p.events, picked);
            if (complete) status.className = 'status good';
            render(complete);
            if (complete) solved();
          },
        },
        pos >= 0 ? h('span', { class: 'num' }, pos + 1) : null,
        p.events[i][0],
        revealYears || pos >= 0 ? h('span', { class: 'yr' }, p.events[i][1]) : null);
      }));
    };
    render();
    return [list, status];
  },

  memory(p, solved) {
    const deck = P.memoryDeck(p.pairs);
    const status = h('p', { class: 'status' }, 'Find all the matching pairs.');
    let open = [];
    let matched = 0;
    let moves = 0;
    let lock = false;
    const btns = deck.map((c, i) => h('button', {
      'aria-label': 'Hidden card',
      onclick: () => {
        const b = btns[i];
        if (lock || b.classList.contains('up') || b.classList.contains('done')) return;
        b.classList.add('up');
        b.textContent = c.label;
        open.push(i);
        if (open.length < 2) return;
        moves++;
        const [a, z] = open;
        open = [];
        if (deck[a].pair === deck[z].pair) {
          [a, z].forEach((k) => btns[k].classList.replace('up', 'done'));
          matched++;
          if (matched === p.pairs.length) {
            status.textContent = `All matched in ${moves} moves!`;
            status.className = 'status good';
            solved();
          }
        } else {
          lock = true;
          setTimeout(() => {
            [a, z].forEach((k) => { btns[k].classList.remove('up'); btns[k].textContent = '?'; });
            lock = false;
          }, 850);
        }
      },
    }, '?'));
    return [h('div', { class: 'grid mem' }, btns), status];
  },

  slider(p, solved) {
    let tiles = P.newSlider();
    let moves = 0;
    let done = false;
    const grid = h('div', { class: 'grid slider' });
    const status = h('p', { class: 'status' }, 'Tap a tile next to the gap to slide it.');
    const render = () => grid.replaceChildren(...tiles.map((n, i) => h('button', {
      class: n === 0 ? 'blank' : null, 'aria-label': n === 0 ? 'Empty space' : `Tile ${n}`,
      onclick: () => {
        if (done) return;
        const next = P.moveTile(tiles, i);
        if (!next) return;
        tiles = next;
        moves++;
        status.textContent = `Moves: ${moves}`;
        render();
        if (P.isSolved(tiles)) {
          done = true;
          status.textContent = `Solved in ${moves} moves!`;
          status.className = 'status good';
          solved();
        }
      },
    }, n || '')));
    render();
    return [grid, status];
  },
};

// ---------- feed ----------
const feed = $('#feed');
let currentTopic = 'all';
let currentView = 'feed';
let round = 0;
let active = null;

const observer = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting && e.intersectionRatio >= 0.6) setActive(e.target);
    else if (e.target === active && e.intersectionRatio < 0.6) e.target._player?.pause();
  }
}, { root: feed, threshold: [0, 0.6] });

function activePlayer() { return active?._player; }
function resumeActive() {
  const pl = activePlayer();
  if (pl && !active.classList.contains('user-paused')) pl.play();
}
function setActive(card) {
  if (active && active !== card) active._player?.pause();
  active = card;
  if (currentView === 'feed' && $('#sheet').hidden) resumeActive();
  const cards = $$('.card', feed);
  if (cards.indexOf(card) >= cards.length - 3) appendRound();
}

function appendRound(firstId) {
  let items = buildFeed({
    lessons: allLessons(), puzzles: PUZZLES, topic: currentTopic,
    liked: state.liked, seen: [...state.completed, ...state.solved],
    rng: mulberry32((Date.now() + round * 7919) >>> 0),
  });
  if (firstId) {
    const first = findItem(firstId);
    items = first ? [first, ...items.filter((it) => it.id !== firstId)] : items;
  }
  if (!items.length) {
    if (!round) feed.append(h('div', { class: 'empty' }, 'Nothing here yet — try another topic.'));
    return;
  }
  // Avoid showing the same item twice in a row across rounds.
  const lastId = $$('.card', feed).at(-1)?.dataset.id;
  if (items.length > 1 && items[0].id === lastId) items.push(items.shift());
  round++;
  for (const it of items) {
    const card = it.slides ? renderLesson(it) : renderPuzzle(it);
    feed.append(card);
    observer.observe(card);
  }
}

function resetFeed(topic = currentTopic, firstId) {
  $$('.card', feed).forEach((c) => { c._player?.pause(); observer.unobserve(c); });
  active = null;
  feed.replaceChildren();
  currentTopic = topic;
  round = 0;
  appendRound(firstId);
  feed.scrollTop = 0;
  renderChips();
}

function scrollFeed(dir) {
  feed.scrollBy({ top: dir * feed.clientHeight, behavior: 'smooth' });
}

function renderChips() {
  const chips = [['all', 'For You'], ['puzzles', '🧩 Puzzles'], ...TOPICS.map((t) => [t.id, `${t.icon} ${t.name}`])];
  $('#chips').replaceChildren(...chips.map(([id, label]) =>
    h('button', { class: `chip${id === currentTopic ? ' active' : ''}`, onclick: () => resetFeed(id) }, label)));
  $('#chips .active')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

// ---------- views ----------
function go(view) {
  currentView = view;
  $$('.view').forEach((v) => { v.hidden = v.dataset.view !== view && v.dataset.view !== 'feed'; });
  $$('.tabbar button').forEach((b) => b.classList.toggle('active', b.dataset.go === view));
  $('.topbar').hidden = view !== 'feed';
  if (view === 'feed') resumeActive();
  else { activePlayer()?.pause(); RENDER_VIEW[view]?.(); }
}

function listItem(it, extra) {
  const t = topicById(it.topic);
  return h('div', { class: 'item', '--c1': t.colors[0], '--c2': t.colors[1] },
    h('button', { class: 'item', style: { padding: 0, background: 'none', flex: '1' }, onclick: () => openInFeed(it.id) },
      h('span', { class: 'ico' }, it.slides ? it.slides[0][0] : '🧩'),
      h('span', { class: 'grow' }, h('div', { class: 't' }, it.title), h('div', { class: 's' }, it.slides ? `${t.name} · lesson` : `${t.name} · ${PUZZLE_KIND[it.type]}`))),
    extra);
}
function openInFeed(id) {
  go('feed');
  resetFeed('all', id);
}

const RENDER_VIEW = {
  explore() {
    $('#topicGrid').replaceChildren(...TOPICS.map((t) => {
      const nl = allLessons().filter((l) => l.topic === t.id).length;
      const np = PUZZLES.filter((x) => x.topic === t.id).length;
      return h('button', { class: 'topic', '--c1': t.colors[0], '--c2': t.colors[1], onclick: () => { go('feed'); resetFeed(t.id); } },
        h('div', { class: 'i' }, t.icon), h('div', { class: 'n' }, t.name), h('div', { class: 'c' }, `${nl} lessons · ${np} puzzles`));
    }));
    renderSearch();
  },
  create() {
    $('#createTopic').replaceChildren(...TOPICS.map((t) => h('option', { value: t.id }, `${t.icon} ${t.name}`)));
    const mine = state.custom;
    $('#myLessons').replaceChildren(...(mine.length
      ? mine.map((l) => listItem(l, h('button', { class: 'x', 'aria-label': 'Delete', onclick: () => deleteCustom(l.id) }, '✕')))
      : [h('p', { class: 'muted' }, 'Nothing yet — your first lesson is one form away.')]));
  },
  profile() {
    const lv = P.levelFor(state.xp);
    const streak = P.currentStreak(state.streak, today());
    $('#profileStats').replaceChildren(
      h('div', { class: 'level' },
        h('div', { class: 'badge' }, lv.level),
        h('div', { class: 'grow', style: { flex: 1 } },
          h('div', { style: { fontWeight: 800 } }, `Level ${lv.level} · ${state.xp} XP`),
          h('div', { class: 'bar' }, h('i', { style: { width: `${lv.into}%` } })),
          h('div', { class: 'muted', style: { fontSize: '12px', marginTop: '4px' } }, `${lv.need - lv.into} XP to level ${lv.level + 1}`))),
      h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', {}, `🔥 ${streak}`), h('span', {}, 'day streak')),
        h('div', { class: 'stat' }, h('b', {}, state.completed.length), h('span', {}, 'lessons')),
        h('div', { class: 'stat' }, h('b', {}, state.solved.length), h('span', {}, 'puzzles'))),
    );
    const saved = state.saved.map(findItem).filter(Boolean);
    $('#savedList').replaceChildren(...(saved.length ? saved.map((it) => listItem(it))
      : [h('p', { class: 'muted' }, 'Tap 🔖 on anything in the feed to save it here.')]));
    $('#narrationToggle').checked = state.narration;
    $('#narrationToggle').disabled = !canSpeak;
  },
};

function renderSearch() {
  const q = $('#search').value.trim().toLowerCase();
  if (!q) return $('#searchResults').replaceChildren();
  const hits = allItems().filter((it) =>
    [it.title, it.hint, it.word, ...(it.slides || []).map((s) => s[1])].filter(Boolean).join(' ').toLowerCase().includes(q));
  $('#searchResults').replaceChildren(...(hits.length ? hits.slice(0, 20).map((it) => listItem(it)) : [h('p', { class: 'muted' }, 'No matches.')]));
}

// ---------- create ----------
$('#createForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const topic = f.get('topic');
  const slides = parseSlides(String(f.get('slides')), topicById(topic).icon);
  if (!slides.length) return toast('Add at least one slide');
  const lesson = {
    id: `u-${Date.now().toString(36)}`, topic, creator: 'you',
    title: String(f.get('title')).trim(), slides,
    more: String(f.get('more') || '').trim(), source: String(f.get('source') || '').trim(),
  };
  state.custom = [lesson, ...state.custom];
  persist();
  e.target.reset();
  toast('Published to your feed');
  openInFeed(lesson.id);
});

function deleteCustom(id) {
  state.custom = state.custom.filter((l) => l.id !== id);
  state.saved = state.saved.filter((x) => x !== id);
  persist();
  RENDER_VIEW.create();
}

// ---------- wiring ----------
$$('.tabbar button').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));
$('#sheet').addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeSheet(); });
$('#search').addEventListener('input', renderSearch);
$('#narrationBtn').addEventListener('click', () => {
  setNarration(!state.narration);
  toast(state.narration ? 'Narration on' : canSpeak ? 'Narration off' : 'Narration not supported in this browser');
  if (state.narration && activePlayer()?.playing) active._player.show(active._player.i);
});
$('#narrationToggle').addEventListener('change', (e) => setNarration(e.target.checked));
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Reset XP, streak, likes and saved items? Your created lessons are kept.')) return;
  Object.assign(state, { xp: 0, liked: [], saved: [], completed: [], solved: [], streak: null });
  persist();
  RENDER_VIEW.profile();
  resetFeed('all');
});

document.addEventListener('keydown', (e) => {
  if (currentView !== 'feed' || !$('#sheet').hidden || e.target.matches('input, textarea, select')) {
    if (e.key === 'Escape' && !$('#sheet').hidden) closeSheet();
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); scrollFeed(1); }
  else if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); scrollFeed(-1); }
  else if (e.key === ' ' && activePlayer()) { e.preventDefault(); activePlayer().toggle(); }
  else if (e.key === 'ArrowRight' && activePlayer()) activePlayer().next();
  else if (e.key === 'ArrowLeft' && activePlayer()) activePlayer().prev();
  else if (e.key === 'l' && active) toggleLike(active.dataset.id);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) activePlayer()?.pause();
  else if (currentView === 'feed' && $('#sheet').hidden) resumeActive();
});

setNarration(state.narration);
const deepLink = decodeURIComponent(location.hash.slice(1));
resetFeed('all', findItem(deepLink) ? deepLink : undefined);
