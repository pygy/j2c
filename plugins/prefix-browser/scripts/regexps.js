/*eslint-env node*/
/*eslint no-console: 0*/
/* global capture: false, either:false, flags: false, greedy:false, sequence: false*/

global.__proto__ = require('compose-regexp')

// These regexes match strings, comments and the targets we really want to match.
// They will thus never match a target inside a string or a comment.
// The end result is verbose, but repeated, identically every time and thus it
// compresses well, ultimately.

var string1 = sequence(
  "'",
  greedy('*',
    /\\[\S\s]|[^']/
  ),
  "'"
)
var string2 = sequence(
  '"',
  greedy('*',
    /\\[\S\s]|[^"]/
  ),
  '"'
)
var comment = sequence(
  '/*',
  /[\S\s]*?/,
  '*/'
)

var selectorMatcher = JSON.stringify(
  either(
    string2, string1, comment,
    sequence(capture('SPLIT HERE'), /\b/)
  ).source
)
console.log('selectorMatcher = new RegExp(' + selectorMatcher + ')')

// Match parentheses nested five level deep:
// `crossfade(linear-gradient(to-bottom rgb(calc(var(--bad) + 7), 10, 10) #f00), #00f, 50%)`
// while ignoring strings and comments
// Obtained by nesting the following base pattern five times:


function nest(next) {
  return greedy('*',
    either(
      string1, string2, comment,
      sequence( '(', next, ')' ),
      /[^\)]/
    )
  )
}

var atSupportsParamsMatcher = flags('g', sequence(
  /\(\s*([-\w]+)\s*:\s*/,
  capture(
    nest(nest(nest(nest(nest(nest(
      greedy('*',
        either(string1, string2, comment, /[^\)]/)
      )
    ))))))
  )
))


// So we get
// /\(\s*([-\w]+)\s*:\s*((?:(?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:(?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:(?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:(?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\((?:(?:'(?:\\[\S\s]|[^'])*'|"(?:\\[\S\s]|[^"])*"|\/\*[\S\s]*?\*\/|\([^\)]*\)|[^\)]))*\)|[^\)]))*\)|[^\)]))*\)|[^\)]))*\)|[^\)]))*)/g
// which becomes
// /\(\s*([-\w]+)\s*:\s*((?:"(?:\\[\S\s]|[^"])*"|'(?:\\[\S\s]|[^'])*'|\/\*[\S\s]*?\*\/|\((?:"(?:\\[\S\s]|[^"])*"|'(?:\\[\S\s]|[^'])*'|\/\*[\S\s]*?\*\/|\((?:"(?:\\[\S\s]|[^"])*"|'(?:\\[\S\s]|[^'])*'|\/\*[\S\s]*?\*\/|\((?:"(?:\\[\S\s]|[^"])*"|'(?:\\[\S\s]|[^'])*'|\/\*[\S\s]*?\*\/|\((?:"(?:\\[\S\s]|[^"])*"|'(?:\\[\S\s]|[^'])*'|\/\*[\S\s]*?\*\/|\([^\)]*\)|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*\)|[^\)])*)/g
// after replacing `(?:(?:` with `(?:` and `]))*` with `])*`.
atSupportsParamsMatcher = new RegExp(
  atSupportsParamsMatcher.source
    .replace(/\(\?:\(\?:/g,'(?:')
    .replace(/\]\)\)/g, '])'),
  'g'
)
console.log()
console.log('var atSupportsParamsMatcher = ', atSupportsParamsMatcher)