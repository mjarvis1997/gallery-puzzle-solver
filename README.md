# Gallery Puzzle Solver

A small web app that solves a specific word puzzle: given a 2D grid where each
of the N positions offers several character options, it finds **every valid
English word** formed by picking one character from each position, in order.

> **Live:** https://mjarvis1997.github.io/gallery-puzzle-solver/

```
Input            Output (most → least common)
[c, b, d]   →    bad, dad, bed, bet, cat, cos, bat, dot, …
[a, e, o]
[d, t, s]
```

See [`docs/puzzle.md`](docs/puzzle.md) for the full puzzle definition.

## How it works

- **Solver.** Rather than generating all Mᴺ character combinations (which
  explodes), the solver *filters the dictionary*: it keeps only the length-N
  words whose every character is allowed at its position. This is `O(W·N)`,
  bounded by dictionary size. The core logic in
  [`src/solver/solvePuzzle.ts`](src/solver/solvePuzzle.ts) is pure (no `fetch`,
  no DOM), so it is trivially testable.

- **Dictionary strategy.** The word list is **SUBTLEX-US** — a frequency list of
  words people actually use, which avoids the obscure long tail of
  Scrabble-style dictionaries *and* gives us a frequency value per word. At build
  time, [`scripts/build-dictionary.ts`](scripts/build-dictionary.ts) preprocesses
  it into per-length files (`public/dictionary/len-{N}.txt`), one `word<TAB>zipf`
  per line, plus an `index.json` of counts. The app fetches only the file for the
  input word-length.

- **Frequency filtering.** Each word carries a **Zipf** frequency
  (`log10(SUBTLWF) + 3`, a ~1.3–7.6 scale where `the` ≈ 7.5). Results are sorted
  common-first, and a slider lets you trim the rarer tail — nothing is hidden by
  default.

## Sources

The dictionary is **SUBTLEX-US** (Brysbaert & New, 2009), free for research and
educational use. Provenance, columns used, and the preprocessing steps are
documented in [`assets/words.md`](assets/words.md).

> Brysbaert, M., & New, B. (2009). Moving beyond Kučera and Francis: A critical
> evaluation of current word frequency norms and the introduction of a new and
> improved word frequency measure for American English. *Behavior Research
> Methods, 41*(4), 977–990.

## Development

Built with Vite + React + TypeScript, using [Bun](https://bun.sh) as the runtime.

```sh
bun install
bun run gen:dict   # generate public/dictionary/ from assets/words.txt (one-time / after dictionary changes)
bun run dev        # http://localhost:3000/gallery-puzzle-solver/
```

Other scripts: `bun run typecheck`, `bun test`, `bun run build`.

Deployment is automated via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
on push to `main` (Pages source must be set to **GitHub Actions**).
