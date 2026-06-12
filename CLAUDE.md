# CLAUDE.md

## Generic Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## Project Specific Notes
`gallery-puzzle-solver` is a tool for solving a specific kind of word puzzle. The puzzle itself is defined in `docs/puzzle.md`. A list of all valid english words is provided in `assets/words.json`. The main function of the project is `solvePuzzle`, which takes in a 2D array of characters and returns an array of valid English words that can be formed by taking one character from each subarray, in order.

### Tooling
- Code is written in TypeScript
- Use bun.js for development runtime and static type checking
- In production, we will host it as a simple Github Pages static site.
- When possible, use built in APIs instead of third-party dependencies
- Create unit tests for simple functions with Bun's built in test runner
- Create integration tests for the main `solvePuzzle` function, using the example from `docs/puzzle.md` as a test case

### Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')

### Workflow
- Be sure to typecheck when you're done making a series of code changes
- Prefer running single tests, and not the whole test suite, for performance
- Make a git commit after each logical step (e.g. a completed plan checklist item or a self-contained change). Only commit once the step is complete and verified — typecheck and any relevant tests pass. Use clear, conventional commit messages. They should be no longer than 10 words.
- Assume my web app is already running on localhost:3000. Use the browser to open it and check the checkout flow. Let me know if it is not running or if you have any issues accessing it.

### Guidelines
- Never read the entire `assets/words.json` file into the Claude session. You can read chunks of it or grep as needed, but be mindful of the token limit.
- This is not a serious production project, so it's ok to make some tradeoffs for simplicity and speed of development. There should be no authentication or user accounts, and we can assume that the input will be well-formed. However, we should still strive for clean, maintainable code and a good user experience.
- There will be no backend server. All logic should be implemented in the frontend, and all data should be loaded as static assets. This means that we need to be mindful of performance and memory usage.