import { describe, expect, test } from 'bun:test';
import { buildSeededGrid } from './randomGrid';
import { solvePuzzle } from '../solver/solvePuzzle';

const WORDS = ['cat', 'cot', 'bat', 'bot', 'dog', 'dot', 'cab', 'car', 'can', 'bad', 'bed', 'dad'];

describe('buildSeededGrid', () => {
  test('produces a grid guaranteed to contain at least `goal` solutions', () => {
    // Run many trials since the construction is randomized; the guarantee must
    // hold on every one.
    for (let trial = 0; trial < 100; trial++) {
      const grid = buildSeededGrid(3, 3, WORDS, 3);

      expect(grid.length).toBe(3);
      for (const options of grid) expect(options.length).toBe(3);

      expect(solvePuzzle(grid, WORDS).length).toBeGreaterThanOrEqual(3);
    }
  });

  test('falls back to a fully random a–z grid when no words are available', () => {
    const grid = buildSeededGrid(4, 2, [], 3);

    expect(grid.length).toBe(4);
    for (const options of grid) {
      expect(options.length).toBe(2);
      for (const ch of options) expect(ch).toMatch(/^[a-z]$/);
    }
  });

  test('degrades gracefully when m is too small to fit `goal` distinct words', () => {
    // m=1 means each position holds one character, so only one word can exist.
    const grid = buildSeededGrid(3, 1, WORDS, 3);
    for (const options of grid) expect(options.length).toBe(1);
    expect(solvePuzzle(grid, WORDS).length).toBeGreaterThanOrEqual(1);
  });
});
