import { useState } from 'react';
import { loadWordsByLength } from '../solver/dictionary';
import { solvePuzzle } from '../solver/solvePuzzle';
import type { Grid, WordEntry } from '../solver/types';
import { PuzzleInput } from './PuzzleInput';
import { Results } from './Results';

const MIN_ZIPF = 1; // below the dictionary's floor (~1.3), so nothing is hidden by default
const MAX_ZIPF = 7.5;

// The example puzzle from docs/puzzle.md, shown on load.
const EXAMPLE_GRID: Grid = [
  ['c', 'b', 'd'],
  ['a', 'e', 'o'],
  ['d', 't', 's'],
];

export function App() {
  const [grid, setGrid] = useState<Grid>(EXAMPLE_GRID);
  const [matches, setMatches] = useState<WordEntry[] | null>(null);
  const [minZipf, setMinZipf] = useState(MIN_ZIPF);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await loadWordsByLength(grid.length);
      const zipf = new Map(entries.map((e) => [e.word, e.zipf]));
      const found = solvePuzzle(grid, [...zipf.keys()])
        .map((word) => ({ word, zipf: zipf.get(word)! }))
        .sort((a, b) => b.zipf - a.zipf);
      setMatches(found);
    } catch {
      setMatches(null);
      setError(`No dictionary available for ${grid.length}-letter words.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app">
      <header>
        <h1>Gallery Puzzle Solver</h1>
        <p className="tagline">
          Pick one character from each position, in order, to find every valid English word.
        </p>
      </header>

      <PuzzleInput grid={grid} onGridChange={setGrid} onSolve={handleSolve} loading={loading} />

      {error && <p className="error">{error}</p>}

      {matches !== null && matches.length > 0 && (
        <div className="frequency-control">
          <label htmlFor="freq">Min. frequency (Zipf): {minZipf.toFixed(1)}</label>
          <input
            id="freq"
            type="range"
            min={MIN_ZIPF}
            max={MAX_ZIPF}
            step={0.1}
            value={minZipf}
            onChange={(e) => setMinZipf(e.target.valueAsNumber)}
          />
          <span className="frequency-hint">all words ⟵ drag ⟶ common only</span>
        </div>
      )}

      <Results matches={matches} minZipf={minZipf} />

      <footer>
        Word frequencies from the{' '}
        <a href="https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexus">
          SUBTLEX-US
        </a>{' '}
        corpus (Brysbaert &amp; New, 2009).
      </footer>
    </main>
  );
}
