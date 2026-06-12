import type { Grid } from '../solver/types';

const MAX_LENGTH = 31; // longest length present in the dictionary
const MAX_OPTIONS = 10;

type Props = {
  grid: Grid;
  onGridChange: (grid: Grid) => void;
  onSolve: () => void;
  loading: boolean;
};

/** Resize the grid to `n` positions × `m` options, preserving existing cells. */
function resizeGrid(grid: Grid, n: number, m: number): Grid {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: m }, (_, j) => grid[i]?.[j] ?? ''),
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isNaN(value) ? min : value));

const randomLetter = () => String.fromCharCode(97 + Math.floor(Math.random() * 26));

export function PuzzleInput({ grid, onGridChange, onSolve, loading }: Props) {
  const n = grid.length;
  const m = grid[0]?.length ?? 0;

  const setCell = (position: number, option: number, value: string) => {
    const next = grid.map((col) => [...col]);
    next[position][option] = value.toLowerCase().slice(0, 1);
    onGridChange(next);
  };

  const randomize = () => onGridChange(grid.map((col) => col.map(randomLetter)));

  return (
    <section className="puzzle-input">
      <div className="dimensions">
        <label>
          Word length (N)
          <input
            type="number"
            min={1}
            max={MAX_LENGTH}
            value={n}
            onChange={(e) => onGridChange(resizeGrid(grid, clamp(e.target.valueAsNumber, 1, MAX_LENGTH), m))}
          />
        </label>
        <label>
          Options per position (M)
          <input
            type="number"
            min={1}
            max={MAX_OPTIONS}
            value={m}
            onChange={(e) => onGridChange(resizeGrid(grid, n, clamp(e.target.valueAsNumber, 1, MAX_OPTIONS)))}
          />
        </label>
      </div>

      <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, auto)` }}>
        {grid.map((options, position) => (
          <div className="grid-column" key={position}>
            <div className="grid-heading">{position + 1}</div>
            {options.map((char, option) => (
              <input
                key={option}
                className="grid-cell"
                maxLength={1}
                value={char}
                aria-label={`Position ${position + 1}, option ${option + 1}`}
                onChange={(e) => setCell(position, option, e.target.value)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="randomize-button" onClick={randomize} disabled={loading}>
          Randomize
        </button>
        <button className="solve-button" onClick={onSolve} disabled={loading}>
          {loading ? 'Solving…' : 'Solve'}
        </button>
      </div>
    </section>
  );
}
