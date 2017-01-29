/*eslint-env node*/
/*eslint no-console: 0*/
/* global capture: false, either:false, flags: false, greedy:false, sequence: false*/
global.__proto__ = require('compose-regexp')

// var maybe = greedy.bind(null, '?')

var animation = either(
    capture(
        'var(',
        /[^)]+/,
        ')'
    ),
    sequence(
        /:?/,
        'global(',
        /\s*/,
        capture(/[_A-Za-z][-\w]*/),
        /\s*/,
        ')'
    ),
    sequence(
        capture(),
        capture(/-?[_A-Za-z][-\w]*/)
    )
)
console.log('animation / animation-name / @keyframes\n', animation)

var selector = flags('g',
    either(
        capture(
            either(
                sequence(
                    '"',
                    greedy('*',
                        either(
                            /\\./,
                            /[^"\n]/
                        )
                    ),
                    '"'
                ),
                sequence(
                    "'",
                    greedy('*',
                        either(
                            /\\./,
                            /[^'\n]/
                        )
                    ),
                    "'"
                ),
                // This is both correct and faster than the W3C regexp.
                // https://jsperf.com/regexpcomment
                sequence(
                    '/*',
                    /[\s\S]*?/,
                    '*/'
                )
            )
        ),
        sequence(
            ':global(',
            /\s*/,
            capture(
                '.',
                /-?[_A-Za-z][-\w]*/
            ),
            /\s*/,
            ')'
        ),
        sequence(
            capture('.'),
            capture(/-?[_A-Za-z][-\w]*/)
        )
    )
)

console.log('selector / @global\n', selector)

var selectorTokenizer = flags('g',
    either(
        /[(),]/,
        sequence(
            '"',
            greedy('*',
                either(
                    /\\./,
                    /[^"\n]/
                )
            ),
            '"'
        ),
        sequence(
            "'",
            greedy('*',
                either(
                    /\\./,
                    /[^'\n]/
                )
            ),
            "'"
        ),
        sequence(
            '/*',
            /[\s\S]*?/,
            '*/'
        )
    )
)
console.log('selectorTokenizer = ', selectorTokenizer)
