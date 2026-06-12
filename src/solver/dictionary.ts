import type { WordEntry } from './types';

/**
 * Parse the per-length dictionary file format: one `word<TAB>zipf` per line.
 * Pure (no I/O) so it can be unit-tested without a network.
 */
export function parseDictionary(text: string): WordEntry[] {
  return text
    .split('\n')
    .filter((line) => line.length > 0)
    .map((line) => {
      const [word, zipf] = line.split('\t');
      return { word, zipf: Number(zipf) };
    });
}

// One in-flight-or-resolved promise per length, so concurrent callers share a
// single fetch and repeat solves don't refetch.
const cache = new Map<number, Promise<WordEntry[]>>();

/**
 * Fetch and parse the dictionary file for words of length `n`. Results are
 * cached per length; a failed fetch is evicted so it can be retried.
 */
export function loadWordsByLength(n: number): Promise<WordEntry[]> {
  const cached = cache.get(n);
  if (cached) return cached;

  const promise = fetch(`${import.meta.env.BASE_URL}dictionary/len-${n}.txt`)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load dictionary for length ${n} (${res.status})`);
      return res.text();
    })
    .then(parseDictionary)
    .catch((err) => {
      cache.delete(n);
      throw err;
    });

  cache.set(n, promise);
  return promise;
}
