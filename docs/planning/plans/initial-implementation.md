# Initial Implementation Plan — gallery-puzzle-solver

## Context

This is a brand-new, greenfield repo. The goal is to build a tool that solves a word puzzle: given a 2D array where each of the N positions offers M character options, find every valid English word formed by picking one character per position, **in order**.

**Example** (from `docs/puzzle.md`):
```
Input:  [[c,b,d], [a,e,o], [d,t,s]]   →   Output: ['cat', 'bed', 'dot']
```

We need three things: (1) a pure, well-tested `solvePuzzle` function, (2) unit + integration tests, and (3) a React frontend deployed to GitHub Pages where users enter their own puzzles.

### Key findings from exploration
- **Dictionary source: SUBTLEX-US** at `assets/words.txt` (replaced the original `words.json`). Tab-delimited, header row + **74,286 words**, 3.1MB. Columns: `Word, FREQcount, CDcount, FREQlow, Cdlow, SUBTLWF, Lg10WF, SUBTLCD, Lg10CD`. We only need **`Word`** (col 1) and **`SUBTLWF`** (col 6, frequency per million; range 0.02–41857).
  - ~12,571 entries contain capitals/punctuation (`I`, `What`, `don't`) — capitalized forms mostly collide with a lowercase entry.
- **Why SUBTLEX:** the original 370k Scrabble-style list surfaced too many obscure-but-valid words (`bes`, `dod`, `cad`). SUBTLEX is a subtitle-derived frequency list of words people actually use, and it *carries the frequency we need* to let users trim rare results — solving both problems with one static asset, no runtime API.
- No code yet at planning time — only `CLAUDE.md`, `docs/`, `LICENSE`, and the dictionary.

### Resolved decisions
- **Framework:** React + Vite (user preference; scales to a polished UI; clean static build for Pages).
- **Dictionary:** Preprocess `words.txt` into **per-length** files, each line `word<TAB>zipf`. This shrinks the payload, drops unused columns, lets the app fetch only the file for input length N, and carries frequency for client-side filtering.
- **Frequency metric: Zipf** = `log10(SUBTLWF) + 3` (linear ~1.3–7.6 scale; `the`≈7.5, `cad`≈3.5). Computed at build time. Ideal for a UI slider.
- **Filtering = rank, not cut.** Keep all 74k words; the UI hides nothing by default (results sorted common-first) and exposes a **min-Zipf slider** that trims rarer words client-side — instant, no refetch/re-solve, fully reversible.
- **Solver stays pure** on `string[]` (grid logic only — no frequency knowledge). Frequency is loaded alongside and applied as a UI-layer filter.
- **Attribution:** SUBTLEX is free for research/education but expects a citation (Brysbaert & New, 2009). Credit in `assets/words.md`, the README, and a UI footer.
- **Algorithm:** Dictionary-filter, not Cartesian product (see Step 3). Bounded by dictionary size, never by Mᴺ.

---

## Checklist

- [x] **1. Project scaffolding** — Vite + React + TypeScript, Bun scripts, tsconfig, GH Pages base path
- [x] **2. Dictionary preprocessing** — build script: `words.txt` → `public/dictionary/len-{N}.txt` (`word<TAB>zipf`) + `index.json`; add `assets/words.md` source doc
- [x] **3. Core solver** — pure `solvePuzzle(grid, words)` in `src/solver/`
- [ ] **4. Tests** — unit tests for helpers + integration test using the `docs/puzzle.md` example
- [ ] **5. Dictionary loader** — runtime fetch/parse of the per-length file → `{ word, zipf }[]`
- [x] **6. React UI** — puzzle input grid + results (sorted by frequency) + min-Zipf slider, wired to solver; SUBTLEX attribution footer
- [x] **7. GitHub Pages deploy** — Actions workflow + Vite `base` config
- [x] **8. Final verification** — typecheck, tests, local run end-to-end

---

## Proposed structure

```
gallery-puzzle-solver/
├── package.json, tsconfig.json, vite.config.ts, index.html
├── assets/
│   ├── words.txt                    # SUBTLEX-US source (tab-delimited)
│   └── words.md                     # source/provenance + attribution doc
├── scripts/
│   └── build-dictionary.ts          # words.txt → public/dictionary/*
├── public/dictionary/
│   ├── index.json                   # { lengths: { "3": 12345, ... } }
│   └── len-{N}.txt                  # lines of `word<TAB>zipf`, length N
├── src/
│   ├── solver/
│   │   ├── solvePuzzle.ts           # pure logic (string[] in/out)
│   │   ├── solvePuzzle.test.ts      # integration test (puzzle.md example)
│   │   ├── dictionary.ts            # loadWordsByLength(n) → { word, zipf }[]
│   │   └── types.ts
│   ├── ui/{App,PuzzleInput,Results}.tsx
│   └── main.tsx
└── .github/workflows/deploy.yml
```

Separation principle: the solver in `src/solver/` is **pure** (no `fetch`, no DOM) so it's trivially unit-testable; asset loading lives in `dictionary.ts`; React lives in `src/ui/`.

---

## Step 1 — Project scaffolding
- Init `package.json` with Bun. Add deps: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`.
- `tsconfig.json`: ES modules, `strict: true`, `jsx: react-jsx`, bundler module resolution.
- Scripts: `dev` (vite), `build` (`tsc -b && vite build`), `predeploy`/`gen:dict` (run build-dictionary), `test` (`bun test`), `typecheck` (`tsc --noEmit`).
- `vite.config.ts`: set `base: '/gallery-puzzle-solver/'` for Pages (repo-name path).
- **Verify:** `bun install` succeeds; `bun run dev` serves a placeholder page.

## Step 2 — Dictionary preprocessing
- `scripts/build-dictionary.ts` (run with Bun — runs outside the Claude session, so reading the full file here is fine):
  - Read `assets/words.txt`, split into lines, **skip the header row**.
  - For each row, take `Word` (col 0) and `SUBTLWF` (col 5, tab-split).
  - **Clean:** lowercase the word; **keep only `^[a-z]+$`** (drops contractions/hyphens/digits); compute `zipf = log10(SUBTLWF) + 3`, rounded (2 dp).
  - **Dedupe:** when lowercasing collapses casing collisions (`What`→`what`), keep the **max** SUBTLWF.
  - Bucket by `word.length` into `Map<number, {word, zipf}[]>`; sort each bucket by word (alphabetical) for stable output.
  - Write each bucket to `public/dictionary/len-{N}.txt`, one `word<TAB>zipf` per line.
  - Write `public/dictionary/index.json` = `{ lengths: { N: count } }` so the UI knows valid lengths.
- Add **`assets/words.md`**: document the source (SUBTLEX-US), download URL, columns used, the lowercase/`[a-z]`/dedupe cleaning, the Zipf formula, and the **Brysbaert & New (2009) citation**.
- **Verify:** `bun run gen:dict` produces files; `len-3.txt` lines look like `cat\t<zipf>` and contain `cat`, `bed`, `dot`.

## Step 3 — Core solver
Signature: `solvePuzzle(grid: string[][], words: string[]): string[]`
- `N = grid.length`; if `N === 0`, return `[]`.
- Build `positionSets = grid.map(col => new Set(col))` for O(1) membership.
- For each `word` in `words` (already all length N from the per-length file, but guard `word.length === N`): keep it iff `[...word].every((ch, i) => positionSets[i].has(ch))`.
- Return matches.
- **Why this over Cartesian product:** generating all Mᴺ combinations explodes (e.g. M=10,N=7 → 10M). Filtering the (already length-N) dictionary is O(W·N), bounded and small.
- Extract a small pure helper `matchesGrid(word, positionSets)` for unit testing.
- **Note on output order:** results come out in dictionary (alphabetical) order, so the example yields `['bed','cat','dot']` vs the doc's `['cat','bed','dot']`. `docs/puzzle.md` does not specify order — tests compare order-independently (see Step 4).

## Step 4 — Tests (Bun runner)
- **Unit** (`src/solver/*.test.ts`): `matchesGrid` — exact-position matching, non-member rejection, length mismatch.
- **Integration** (`solvePuzzle.test.ts`): use the `docs/puzzle.md` example grid with a **small fixture word list** — not the full dictionary, for speed. The solver only filters by grid-formability (it does *not* judge English-ness — that's the dictionary's role), so negatives must be **real words that can't be formed from the grid**, not nonsense strings. Suggested fixture: `['cat','bed','dot','cot','bad','cap','cats']` where `cap` is excluded (its `p` isn't in position 2) and `cats` is excluded by the length guard. Assert the result equals `['cat','bed','dot','cot','bad']` after sorting both sides (order-independent).
- **Verify:** `bun test src/solver/solvePuzzle.test.ts` passes.

## Step 5 — Dictionary loader
- `src/solver/dictionary.ts`: `async loadWordsByLength(n: number): Promise<WordEntry[]>` where `WordEntry = { word: string; zipf: number }`.
  - `fetch(\`${import.meta.env.BASE_URL}dictionary/len-${n}.txt\`)`, `.text()`, split on `\n`, drop blanks; split each line on `\t` → `{ word, zipf: Number(zipf) }`.
  - Cache results per length in a module-level `Map` to avoid refetching.
- **Verify:** in the running app, loading a length-3 puzzle fetches `len-3.txt`; parsed entries carry a numeric `zipf`.

## Step 6 — React UI
- `PuzzleInput.tsx`: controls for word length N and options-per-position M, rendering an editable grid of single-char inputs (column = position). Keep it barebones but clean.
- `App.tsx`: on "Solve", read the grid, `loadWordsByLength(N)`, run `solvePuzzle` on the bare words, then map matches back to their `zipf` (via a `word→zipf` Map from the loaded entries). Store the matched `WordEntry[]`.
- **Frequency slider:** a min-Zipf control (range ~1.3–7.6, default at minimum = show all). Dragging it **re-filters the already-computed results client-side** — no refetch, no re-solve.
- `Results.tsx`: list matches **sorted by `zipf` descending** (common first); show count (and how many are hidden by the current cutoff); empty-state message. Optionally show each word's Zipf.
- Handle the loading state while the dictionary file fetches.
- **Attribution:** footer crediting SUBTLEX-US (Brysbaert & New, 2009).
- **Verify:** entering the example puzzle shows the matches sorted by frequency; moving the slider trims the rare ones live.

## Step 7 — GitHub Pages deploy
- `.github/workflows/deploy.yml`: on push to `main` — `bun install`, run `build-dictionary` (generates `public/dictionary/`), `bun run build`, upload `dist/`, deploy via `actions/deploy-pages`.
- Confirm `vite.config.ts` `base` matches the repo name so asset URLs resolve under `/gallery-puzzle-solver/`.
- **Resolved:** generate-in-CI. The workflow runs `bun run gen:dict` before `bun run build`, so the gitignored `public/dictionary/` is rebuilt fresh each deploy and bundled into `dist/`.
- **One-time manual step:** in the GitHub repo, set **Settings → Pages → Source = GitHub Actions** (the `deploy.yml` workflow handles the rest on push to `main`).

## Step 8 — Final verification
- `bun run typecheck` — no errors.
- `bun test` — all pass.
- `bun run gen:dict && bun run dev` — open `http://localhost:3000`, enter the example puzzle, confirm `cat`/`bed`/`dot`, and test a custom puzzle.
- (Per `CLAUDE.md`, the app is expected on `localhost:3000` — set Vite `server.port` to 3000.)

---

## Open questions / deferred
- **Commit vs CI-generate the dictionary files** (Step 7) — default to CI-generate.
- **UI polish** — barebones first per the prompt; styling/UX pass is a future iteration.
- **Very large puzzles** — the dictionary-filter approach handles these well; no special handling needed initially.

## Follow-ups from the SUBTLEX switch
- **Regenerate `docs/puzzle.md` example output** against the new SUBTLEX dictionary — some of the previously-listed 22 words (`bes`, `dod`, …) may not exist in SUBTLEX, so the documented output must be recomputed once Step 2 runs on `words.txt`.
- **`WordEntry` type** (`{ word, zipf }`) lives in `src/solver/types.ts`; used by the loader and UI, not the solver.
- Already-completed Steps 1–3 are unaffected by this change except the build script (Step 2), which is being revised here.
