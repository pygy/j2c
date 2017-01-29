# ./src

`j2c` is written in a possibly odd JS style. The goals are to provide a JS-backed SASS clone that has a small size, broad compatibilty and reasonable speed.

As a consequence, the lib is written in shimable ES5 strict mode, with ES6 modules that are eliminated at build time with [rollup](), so that `j2c` works in old IE (for those who are forced to develop for it) and is as small as possible.

The code is also written with maximal gzippability in mind. It sometimes means favouring code duplication over abstraction, since exact duplicates compress better. I also implies sometimes large conditional expressions, and a heavy use of regexps.

Variables are created only to avoid duplicate computation, never for readability. Variables are recycled in independent parts of the code, and don't always have a descriptive name.

These constrains can lead to code that's difficult to scale and bug prone. 

Scalability is not a concern, since I intend `j2c` to remain small. 

Regarding bugs, there's at this point a 2.5/1 test/code ratio (after .min.gzippification of both), and 100% test coverage, which allows to catch a lot of possible mistakes. The RegExps are used wisely, mostly for pattern matching or for lexing. The most complex ones are built separately using a library that emulates multi-line regexps.

But most of all, behind the raw for loops and repetitions lies a clean, functional architecture.

Excluding helpers, `j2c` is built around three almost pure, pattern matching (conceptually) functions that recursively walk down JS objects.

The side effects are well defined:

- populate the buffer (an array of strings to be joined to form the final style sheet)
- populate or query the local namespace (for local class and animation names, and `@composes`)

Each of these are implemented through state holding objects (`buf` and `ns`) that are passed as parameters to the pure functions. Side effects are thus isolated and easy to spot.

Feature isolation makes it trivial to track down and pinpoint the source of bugs when they occur. The hardest bugs I've had to track were, unsurprisingly, while refactoring the impure parts of `j2c`, and especially the class and animation name localization. However, problems usually become evident with a few well placed `console.*` calls.

## Navigating the source:

`main.js` and `extras.js` contain the public API (`j2c` and `j2c.*` functions, respectively)

`sheet.js` handles the selectors part of the tree and dispatch to `at-rules` and `declarations` when needed.

`declarations.js`, `at-rules.js` and `helpers.js` are self-explaining. `declarations.js` is also at the heart of `j2c.inline`.

---

