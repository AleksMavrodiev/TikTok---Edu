// Turns the "Create" textarea into slides: one per line, optional leading emoji.
const EMOJI_START = /^(\p{Extended_Pictographic}(?:️|‍|\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)\s*(.*)$/u;

export function parseSlides(text, fallbackEmoji, max = 12) {
  return text.split('\n').map((l) => l.trim()).filter(Boolean).slice(0, max).map((line) => {
    const m = line.match(EMOJI_START);
    return m && m[2] ? [m[1], m[2]] : [fallbackEmoji, line];
  });
}
