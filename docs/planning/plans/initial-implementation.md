# Initial Implementation Plan — gallery-puzzle-solver

## Context

This is a brand-new, greenfield repo. The goal is to build a tool that solves a word puzzle: given a 2D array where each of the N positions offers M character options, find every valid English word formed by picking one character per position, **in order**.

**Example** (from `docs/puzzle.md`):
```
Input:  [[c,b,d], [a,e,o], [d,t,s]]   →   Output: ['cat', 'bed', 'dot']
```

We need three things: (1) a pure, well-tested `solvePuzzle` function, (2) unit + integration tests, and (3) a React frontend deployed to GitHub Pages where users enter their own puzzles.

### Key findings from exploration
- `assets/words.json` is a JSON **object** `{ "word": 1, ... }`, ~370k entries, all lowercase, 6.8MB. Example words `cat`/`bed`/`dot` confirmed present.
- No code yet — no `package.json`, `tsconfig`, or source. Only `CLAUDE.md`, `docs/`, `LICENSE`, and the dictionary.

### Resolved decisions
- **Framework:** React + Vite (user preference; scales to a polished UI; clean static build for Pages).
- **Dictionary:** Preprocess `words.json` into **per-length, newline-delimited** files. This both shrinks the payload (drops the `": 1,"` overhead) *and* lets the app fetch only the file for the input word-length N.
- **Algorithm:** Dictionary-filter, not Cartesian product (see Step 3). Bounded by dictionary size, never by Mᴺ.

---

## Checklist

- [ ] **1. Project scaffolding** — Vite + React + TypeScript, Bun scripts, tsconfig, GH Pages base path
- [ ] **2. Dictionary preprocessing** — build script: `words.json` → `public/dictionary/len-{N}.txt` + `index.json`
- [ ] **3. Core solver** — pure `solvePuzzle(grid, words)` in `src/solver/`
- [ ] **4. Tests** — unit tests for helpers + integration test using the `docs/puzzle.md` example
- [ ] **5. Dictionary loader** — runtime fetch/parse of the per-length file
- [ ] **6. React UI** — puzzle input grid + results display, wired to solver
- [ ] **7. GitHub Pages deploy** — Actions workflow + Vite `base` config
- [ ] **8. Final verification** — typecheck, tests, local run end-to-end

---

## Proposed structure

```
gallery-puzzle-solver/
├── package.json, tsconfig.json, vite.config.ts, index.html
├── scripts/
│   └── build-dictionary.ts          # words.json → public/dictionary/*
├── public/dictionary/
│   ├── index.json                   # { lengths: { "3": 12345, ... } }
│   └── len-{N}.txt                  # newline-delimited words of length N
├── src/
│   ├── solver/
│   │   ├── solvePuzzle.ts           # pure logic
│   │   ├── solvePuzzle.test.ts      # integration test (puzzle.md example)
│   │   ├── dictionary.ts            # loadWordsByLength(n) — fetch + parse
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
- `scripts/build-dictionary.ts` (run with Bun — this runs outside the Claude session, so reading the full file here is fine):
  - Read `assets/words.json`, take `Object.keys`.
  - Bucket by `word.length` into `Map<number, string[]>`.
  - Write each bucket to `public/dictionary/len-{N}.txt`, newline-delimited.
  - Write `public/dictionary/index.json` = `{ lengths: { N: count } }` so the UI knows valid lengths.
- **Verify:** `bun run scripts/build-dictionary.ts` produces files; `len-3.txt` contains `cat`, `bed`, `dot`.

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
- **Integration** (`solvePuzzle.test.ts`): use the `docs/puzzle.md` example grid with a **small fixture word list** (e.g. `['cat','bed','dot','cot','bad','zzz']`) — not the full 370k dictionary, for speed. Assert the result equals `['cat','bed','dot']` after sorting both sides.
- **Verify:** `bun test src/solver/solvePuzzle.test.ts` passes.

## Step 5 — Dictionary loader
- `src/solver/dictionary.ts`: `async loadWordsByLength(n: number): Promise<string[]>`
  - `fetch(\`${import.meta.env.BASE_URL}dictionary/len-${n}.txt\`)`, `.text()`, split on `\n`, drop blanks.
  - Cache results per length in a module-level `Map` to avoid refetching.
- **Verify:** in the running app, loading a length-3 puzzle fetches `len-3.txt` (visible in network tab).

## Step 6 — React UI
- `PuzzleInput.tsx`: controls for word length N and options-per-position M, rendering an editable grid of single-char inputs (column = position). Keep it barebones but clean.
- `App.tsx`: on "Solve", read the grid, `loadWordsByLength(N)`, call `solvePuzzle`, store results.
- `Results.tsx`: list matches; show count and an empty-state message.
- Handle the loading state while the dictionary file fetches.
- **Verify:** entering the example puzzle in the browser shows `cat`, `bed`, `dot`.

## Step 7 — GitHub Pages deploy
- `.github/workflows/deploy.yml`: on push to `main` — `bun install`, run `build-dictionary` (generates `public/dictionary/`), `bun run build`, upload `dist/`, deploy via `actions/deploy-pages`.
- Confirm `vite.config.ts` `base` matches the repo name so asset URLs resolve under `/gallery-puzzle-solver/`.
- **Open item:** commit generated dictionary vs generate-in-CI. Recommend generate-in-CI + gitignore to keep the repo lean; revisit if CI time is a concern.

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
