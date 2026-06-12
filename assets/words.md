# Word list source

The dictionary used by this project is **SUBTLEX-US**, a word-frequency list
derived from ~51 million words of US film and television subtitles. We chose it
because it lists words people actually use (filtering out the obscure-but-valid
long tail of Scrabble-style dictionaries) **and** carries a frequency value we
expose as a "trim rare words" slider in the UI.

## Obtaining the file

- Source page: <https://www.ugent.be/pp/experimentele-psychologie/en/research/documents/subtlexus>
- Download the **tab-delimited text version** (not the `.xlsx`) and save it as
  `assets/words.txt`.
- The file has a header row and 74,286 word rows. Columns:

  | Col | Name | Used? |
  | --- | --- | --- |
  | 0 | `Word` | ✅ |
  | 1 | `FREQcount` | |
  | 2 | `CDcount` | |
  | 3 | `FREQlow` | |
  | 4 | `Cdlow` | |
  | 5 | `SUBTLWF` (frequency per million) | ✅ |
  | 6 | `Lg10WF` | |
  | 7 | `SUBTLCD` | |
  | 8 | `Lg10CD` | |

## Preprocessing

`scripts/build-dictionary.ts` turns `words.txt` into per-length files under
`public/dictionary/` (regenerated at build time; not committed). For each row it:

- lowercases `Word` and keeps only `^[a-z]+$` (drops contractions, hyphens, etc.);
- dedupes casing collisions (`What` → `what`), keeping the **max** `SUBTLWF`;
- computes a **Zipf** frequency: `zipf = log10(SUBTLWF) + 3`
  (a linear ~1.3–7.6 scale: `the` ≈ 7.5, a rare word like `cad` ≈ 3.0).

Output: `len-{N}.txt` with one `word<TAB>zipf` per line, plus `index.json`
mapping each length to its word count.

## Attribution

SUBTLEX-US is free for research and educational use. Please cite:

> Brysbaert, M., & New, B. (2009). Moving beyond Kučera and Francis: A critical
> evaluation of current word frequency norms and the introduction of a new and
> improved word frequency measure for American English. *Behavior Research
> Methods, 41*(4), 977–990.
