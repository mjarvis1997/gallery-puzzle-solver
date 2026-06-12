/**
 * Preprocess the SUBTLEX-US word list (assets/words.txt) into per-length,
 * newline-delimited word files carrying a frequency (Zipf) value.
 *
 * Source format: tab-delimited, one header row, columns
 *   Word  FREQcount  CDcount  FREQlow  Cdlow  SUBTLWF  Lg10WF  SUBTLCD  Lg10CD
 * We use only `Word` (col 0) and `SUBTLWF` (col 5, frequency per million).
 *
 * Output:
 *   public/dictionary/len-{N}.txt  — lines of `word<TAB>zipf`, sorted by word
 *   public/dictionary/index.json   — { lengths: { "N": count, ... } }
 *
 * Cleaning: lowercase, keep only /^[a-z]+$/ (drops contractions/hyphens/
 * proper-noun punctuation), and dedupe casing collisions keeping the max
 * frequency. Zipf = log10(SUBTLWF) + 3.
 *
 * Run with Bun (outside the app): `bun run scripts/build-dictionary.ts`.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SOURCE = join(ROOT, 'assets', 'words.txt');
const OUT_DIR = join(ROOT, 'public', 'dictionary');

const WORD_COL = 0;
const SUBTLWF_COL = 5;

const text = await Bun.file(SOURCE).text();
const lines = text.split('\n');

// Dedupe casing collisions (e.g. "What" -> "what"), keeping the max frequency.
const maxFreq = new Map<string, number>();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line) continue;
  const cols = line.split('\t');
  const word = cols[WORD_COL].toLowerCase();
  if (!/^[a-z]+$/.test(word)) continue;
  const subtlwf = Number(cols[SUBTLWF_COL]);
  if (!(subtlwf > 0)) continue; // skip 0/NaN — log10 would be invalid
  const existing = maxFreq.get(word);
  if (existing === undefined || subtlwf > existing) maxFreq.set(word, subtlwf);
}

const zipf = (subtlwf: number) => Math.round((Math.log10(subtlwf) + 3) * 100) / 100;

const byLength = new Map<number, string[]>();
for (const [word, subtlwf] of maxFreq) {
  const bucket = byLength.get(word.length);
  const entry = `${word}\t${zipf(subtlwf)}`;
  if (bucket) bucket.push(entry);
  else byLength.set(word.length, [entry]);
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const lengths: Record<number, number> = {};
for (const [length, bucket] of byLength) {
  bucket.sort(); // alphabetical by word ("word\tzipf" sorts on the word prefix)
  lengths[length] = bucket.length;
  await writeFile(join(OUT_DIR, `len-${length}.txt`), bucket.join('\n') + '\n');
}

await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify({ lengths }, null, 2));

console.log(`Wrote ${maxFreq.size} words across ${byLength.size} length buckets to ${OUT_DIR}`);
