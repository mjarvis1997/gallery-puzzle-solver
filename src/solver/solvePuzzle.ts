import type { Grid } from './types';

/**
 * Returns true iff `word` can be formed by picking, at each position `i`, a
 * character present in `positionSets[i]`. Assumes `word.length` matches the
 * number of position sets.
 */
export function matchesGrid(word: string, positionSets: Set<string>[]): boolean {
  for (let i = 0; i < positionSets.length; i++) {
    if (!positionSets[i].has(word[i])) return false;
  }
  return true;
}

/**
 * Given a puzzle `grid` (one character set per position) and a list of candidate
 * `words`, return every word that can be formed by taking one character from
 * each position, in order.
 *
 * Approach: filter the dictionary rather than generating the Mᴺ Cartesian
 * product. `words` is expected to already be length-N (from the per-length
 * dictionary file), but we guard the length anyway. Cost is O(W·N).
 */
export function solvePuzzle(grid: Grid, words: string[]): string[] {
  const n = grid.length;
  if (n === 0) return [];

  const positionSets = grid.map((position) => new Set(position));

  return words.filter((word) => word.length === n && matchesGrid(word, positionSets));
}
