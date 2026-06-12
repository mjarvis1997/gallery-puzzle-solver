/**
 * A puzzle grid: `grid[i]` holds the candidate characters for position `i` of
 * the word. A solution picks one character from each position, in order.
 */
export type Grid = string[][];

/**
 * A dictionary word paired with its Zipf frequency (~1.3–7.6; higher = more
 * common). Loaded from the per-length dictionary files; used by the UI to sort
 * and trim results. The solver itself operates only on bare words.
 */
export type WordEntry = {
  word: string;
  zipf: number;
};
