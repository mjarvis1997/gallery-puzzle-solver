import { describe, expect, test } from 'bun:test';
import { parseDictionary } from './dictionary';

describe('parseDictionary', () => {
  test('parses word<TAB>zipf lines into entries', () => {
    const text = 'cat\t4.82\nbed\t5.27\ndot\t3.82\n';
    expect(parseDictionary(text)).toEqual([
      { word: 'cat', zipf: 4.82 },
      { word: 'bed', zipf: 5.27 },
      { word: 'dot', zipf: 3.82 },
    ]);
  });

  test('ignores blank lines (e.g. a trailing newline)', () => {
    expect(parseDictionary('cat\t4.82\n\n')).toEqual([{ word: 'cat', zipf: 4.82 }]);
    expect(parseDictionary('')).toEqual([]);
  });
});
