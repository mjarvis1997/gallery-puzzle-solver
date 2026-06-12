# The puzzle
- You are provided with a 2 dimensional array of characters
- The array is size M x N where M is the number of possible characters per index and N is the length of a word
- Each subarray of characters represents possibilites for the N'th character of a word
- Each character index has the same number of possible characters, M, but the characters themselves may differ between indices.
- The output should be an array of all possible words that can be formed by taking one character from each subarray, in order, and that are valid English words.
- Each word in the output should be lowercase
- Each word in the output should be length N

## Example
```
Input:
[
  [c,b,d],
  [a,e,o],
  [d,t,s]
]

Output:
['cat', 'bed', 'dot']
```

