/**
 * Preprocess assets/words.json into per-length, newline-delimited word files.
 *
 * Output:
 *   public/dictionary/len-{N}.txt  — words of length N, one per line, sorted
 *   public/dictionary/index.json   — { lengths: { "N": count, ... } }
 *
 * Run with Bun (outside the app): `bun run scripts/build-dictionary.ts`.
 * This runs at build time, so reading the full dictionary here is fine.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SOURCE = join(ROOT, 'assets', 'words.json');
const OUT_DIR = join(ROOT, 'public', 'dictionary');

const words = (await Bun.file(SOURCE).json()) as Record<string, number>;

const byLength = new Map<number, string[]>();
for (const word of Object.keys(words)) {
  const bucket = byLength.get(word.length);
  if (bucket) bucket.push(word);
  else byLength.set(word.length, [word]);
}

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const lengths: Record<number, number> = {};
for (const [length, bucket] of byLength) {
  bucket.sort();
  lengths[length] = bucket.length;
  await writeFile(join(OUT_DIR, `len-${length}.txt`), bucket.join('\n'));
}

await writeFile(join(OUT_DIR, 'index.json'), JSON.stringify({ lengths }, null, 2));

const totalWords = Object.keys(words).length;
const totalLengths = byLength.size;
console.log(`Wrote ${totalWords} words across ${totalLengths} length buckets to ${OUT_DIR}`);
