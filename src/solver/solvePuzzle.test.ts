import { describe, expect, test } from 'bun:test';
import { matchesGrid, solvePuzzle } from './solvePuzzle';
import type { Grid } from './types';

const sets = (grid: Grid) => grid.map((position) => new Set(position));

// The example puzzle from docs/puzzle.md.
const EXAMPLE_GRID: Grid = [
  ['c', 'b', 'd'],
  ['a', 'e', 'o'],
  ['d', 't', 's'],
];

describe('matchesGrid', () => {
  const positionSets = sets(EXAMPLE_GRID);

  test('accepts a word whose every character sits in its position set', () => {
    expect(matchesGrid('cat', positionSets)).toBe(true);
    expect(matchesGrid('dot', positionSets)).toBe(true);
  });

  test('rejects a word with a character absent from its position set', () => {
    // real word, but 'p' is not among the position-2 options (d, t, s)
    expect(matchesGrid('cap', positionSets)).toBe(false);
  });

  test('rejects when the right characters appear in the wrong positions', () => {
    // 'a' is valid at position 1, not position 0
    expect(matchesGrid('act', positionSets)).toBe(false);
  });
});

describe('solvePuzzle', () => {
  test('returns every grid-formable word from the candidate list', () => {
    // Negatives are real words that simply cannot be formed from the grid:
    //   'cap'  -> 'p' not in position 2
    //   'cats' -> wrong length (excluded by the length guard)
    const candidates = ['cat', 'bed', 'dot', 'cot', 'bad', 'cap', 'cats'];
    const result = solvePuzzle(EXAMPLE_GRID, candidates);

    expect([...result].sort()).toEqual(['bad', 'bed', 'cat', 'cot', 'dot']);
  });

  test('excludes words whose length differs from the grid', () => {
    expect(solvePuzzle(EXAMPLE_GRID, ['cats', 'ca', 'cat'])).toEqual(['cat']);
  });

  test('returns an empty array for an empty grid', () => {
    expect(solvePuzzle([], ['cat', 'bed'])).toEqual([]);
  });

  test('returns an empty array when nothing matches', () => {
    expect(solvePuzzle(EXAMPLE_GRID, ['cap', 'far', 'xyz'])).toEqual([]);
  });
});
