# Inital implementation
I have just created a brand new repo. The guidelines for the project are in `docs/CLAUDE.md`, and the puzzle description is in `docs/puzzle.md`.

## Goals
- Create a function `solvePuzzle` that takes in a 2D array of characters and returns an array of valid English words that can be formed by taking one character from each subarray, in order.
- Create unit tests for simple functions with Bun's built in test runner
- Create integration tests for the main `solvePuzzle` function, using the example from `docs/puzzle.md` as a test case
- Expose a frontend UI for users to input their own puzzles and see the results, hosted on Github Pages

## Decisions to make
- What frontend framework, if any, to use for the UI. I am fine with it being barebones at first but in the future I will want it to look nice. I have most experience with React, but I am open to using something else if it would be simpler for this project.
- How to efficiently check if a generated word is a valid English word (eg. using a Set for O(1) lookups). The data set is quite large with 400k words, so we should be mindful of memory usage and performance.
- How to structure the codebase the codebase for maintainability and scalability. For example, we may want to separate the puzzle-solving logic from the UI code, and we may want to create utility functions for common tasks like generating combinations of characters.

## Next steps
Create a markdown plan document at `docs/planning/plans/initial-implementation.md` outlining the implementation plan and decisions to be made. There should be a clear list of tasks to be completed, and any relevant notes or considerations for each task. The plan should have a checklist at the top for each step so we can track progress. Then each step has a dedicated section below with more details. The plan should be detailed enough that another developer could pick it up and understand what needs to be done without needing to ask for clarification. It is ok if the plan contains decisions that are not fully fleshed out yet, as long as the open questions are clearly noted and there is a plan for how to make those decisions. The first steps will be to settle the decisions before we proceed with the implementation.