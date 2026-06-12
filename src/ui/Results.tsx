import type { WordEntry } from '../solver/types';

type Props = {
  /** All matches, sorted by frequency (descending). `null` before the first solve. */
  matches: WordEntry[] | null;
  /** Minimum Zipf frequency to display. */
  minZipf: number;
};

export function Results({ matches, minZipf }: Props) {
  if (matches === null) return null;

  if (matches.length === 0) {
    return <p className="results-empty">No valid words can be formed from this grid.</p>;
  }

  const visible = matches.filter((entry) => entry.zipf >= minZipf);
  const hidden = matches.length - visible.length;

  return (
    <section className="results">
      <p className="results-count">
        {visible.length} word{visible.length === 1 ? '' : 's'}
        {hidden > 0 && <span className="results-hidden"> ({hidden} rarer hidden)</span>}
      </p>
      {visible.length === 0 ? (
        <p className="results-empty">All matches are below the current frequency cutoff.</p>
      ) : (
        <ul className="results-list">
          {visible.map((entry) => (
            <li className="result-chip" key={entry.word}>
              <span className="result-word">{entry.word}</span>
              <span className="result-zipf">{entry.zipf.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
