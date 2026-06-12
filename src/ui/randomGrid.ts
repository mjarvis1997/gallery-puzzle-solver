import type { Grid } from '../solver/types';

const randomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Build a random n×m grid guaranteed to contain at least `goal` valid words, by
 * embedding real dictionary words ("seeds") and filling the remaining option
 * slots with random letters.
 *
 * Seeds are added greedily only while they fit within m distinct characters per
 * position, so the guarantee degrades gracefully when m is small (m=1 yields a
 * single-word grid). Falls back to a fully random grid when `words` is empty.
 */
export function buildSeededGrid(n: number, m: number, words: string[], goal: number): Grid {
  const positions: Set<string>[] = Array.from({ length: n }, () => new Set());

  let seeded = 0;
  for (const word of shuffle(words)) {
    if (seeded >= goal) break;
    const fits = [...word].every((ch, i) => positions[i].has(ch) || positions[i].size < m);
    if (!fits) continue;
    [...word].forEach((ch, i) => positions[i].add(ch));
    seeded++;
  }

  return positions.map((set) => {
    const chars = [...set];
    while (chars.length < m) {
      const ch = randomLetter();
      if (!chars.includes(ch)) chars.push(ch);
    }
    return shuffle(chars);
  });
}
