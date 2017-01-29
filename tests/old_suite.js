/*eslint-env node*/

// No new tests should be added here.

var o = require('../test-utils/ospec-instance')

// used to normalize styles for reliable comparison.
var minifySelectors = require('postcss-minify-selectors'),
  minifyParams = require('postcss-minify-params'),
  perfectionist = require('perfectionist'),
  postcss = require('postcss')([perfectionist({
    format: 'compressed'
  }), minifySelectors(), minifyParams()])

function normalize(s) {
  return postcss.process(s).css
}

function check(result, expected) {
  result = normalize(result)
  o(normalize(expected)).equals(result)
}

function randStr() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
}

function randInt() {
  return Math.random().toString().substr(2, 3)
}

[
  // '../dist/j2c.commonjs.min',
  '../dist/j2c.commonjs'
  // ,
  // '../dist/inline/j2c.commonjs',
  // '../dist/inline/j2c.commonjs.min'
].forEach(function(lib) {
  var J2c = require(lib)

  o.spec(lib, function() {

    function checkinline(result, expected) {
      result = 'p{' + J2c().inline(result) + '}'
      expected = (expected instanceof Array ? expected : [expected]).map(function(s) {
        return 'p{' + s + '}'
      })
      check(result, expected)
    }


    o.spec('Inline', function() {
      o.beforeEach(function(){
        // ensure that we are not sensitive to additions to Object.prototype.
        Object.prototype.BADBAD = 5
      })
      o.afterEach(function() {
        delete Object.prototype.BADBAD
      })

      o('ensure BADBAD is set to 5', function() {
        o(({}).BADBAD).equals(5)
      })

      o.spec('Basic', function() {
        o('a single property', function() {
          checkinline(
            {
              foo: 'bar'
            },
            'foo:bar;'
          )
        })

        o('two properties, ensure order', function() {
          checkinline(
            {
              foo: 'bar',
              baz: 'qux'
            },
            'foo:bar; baz:qux;'
          )
        })

        o('array of values', function() {
          checkinline(
            {
              foo: ['bar', 'baz']
            },
            'foo:bar; foo:baz;'
          )
        })

        o('one sub-property', function() {
          checkinline(
            {
              foo: {
                bar: 'baz'
              }
            },
            'foo-bar: baz;'
          )
        })

        o('two declrations at the top level', function() {
          checkinline(
            {
              foo: 'qux',
              baz: 'qux'
            },
            'foo:qux;baz:qux;'
          )
        })

        o('two sub-properties', function() {
          checkinline(
            {
              foo: {
                bar: 'baz',
                qux: 'baz'
              }
            },
            'foo-bar:baz; foo-qux:baz;'
          )
        })

        o('two sub-properties with a sub-sub-property', function() {
          checkinline(
            {
              foo: {
                bar: {
                  qux: 'quux'
                },
                baz: {
                  qix: 'qiix'
                }
              }
            },
            'foo-bar-qux:quux; foo-baz-qix:qiix;'
          )
        })

        o('$ operator in sub-property and sub-sub-property', function() {
          checkinline(
            {
              foo: {
                bar: {
                  qux: 'fred',
                  quux: 'frod'
                },
                baz: {
                  qix: 'frad',
                  qiix: 'frud'
                }
              }
            },
            'foo-bar-qux:fred; foo-bar-quux:frod; foo-baz-qix:frad; foo-baz-qiix:frud;'
          )
        })

        o('$ operator at the top level', function() {
          checkinline(
            {
              foo$baz: 'qux'
            },
            'foo:qux;baz:qux;'
          )
        })

        o('$ operator in sub-properties', function() {
          checkinline(
            {
              foo: {
                bar$qux: 'baz'
              }
            },
            'foo-bar:baz; foo-qux:baz;'
          )
        })

        o('$ operator in a sub-property with a sub-sub-property', function() {
          checkinline(
            {
              foo: {
                bar$baz: {
                  qux: 'quux'
                }
              }
            },
            'foo-bar-qux:quux; foo-baz-qux:quux;'
          )
        })

        o('$ operator in sub-property and sub-sub-property', function() {
          checkinline(
            {
              foo: {
                bar$baz: {
                  qux$quux: 'fred'
                }
              }
            },
            'foo-bar-qux:fred; foo-bar-quux:fred; foo-baz-qux:fred; foo-baz-quux:fred;'
          )
        })

        o('convert underscores', function() {
          checkinline(
            {
              'f_o_o': 'bar'
            },
            'f-o-o:bar;'
          )
        })

        o('convert CamelCase', function() {
          checkinline(
            {
              'FoO': 'bar'
            },
            '-fo-o:bar;'
          )
        })

        o('String value', function() {
          checkinline(
            'foo:bar;',
            'foo:bar;'
          )
        })

        o('Array of Strings values', function() {
          checkinline(
            ['foo:bar;', 'foo:baz;'],
            'foo:bar;foo:baz;'
          )
        })

        o('Array of mixed values at the root', function() {
          checkinline(
            ['foo:bar;', {
              foo: 'baz'
            }],
            'foo:bar;foo:baz;'
          )
        })

        o('Array of mixed value and sub-property', function() {
          checkinline(
            {
              foo: ['bar', {
                baz: 'qux'
              }]
            },
            'foo:bar;foo-baz:qux'
          )
        })

        o('Prefixes by hand', function() {
          checkinline(
            {
              _o$_p$: {
                foo: 'bar'
              }
            },
            '-o-foo:bar;-p-foo:bar;foo:bar;'
          )
        })

        o('CSS *Hack', function() {
          // tested manually because the crass normalization
          // outputs an empty string.
          checkinline(
            {
              '*foo': 'bar'
            },
            '*foo:bar;'
          )
        })

        o('CSS _Hack', function() {
          checkinline(
            ['_foo:bar;', {
              _baz: 'qux'
            }],
            '_foo:bar;-baz:qux;'
          )
        })

        o('custom obj.valueOf', function() {
          var bar = {
            valueOf: function() {
              return 'theBAR'
            }
          }
          checkinline(
            {
              foo: bar
            },
            'foo:theBAR;'
          )
        })
      })

      o.spec('Nulls', function() {
        o('null value', function() {
          checkinline(
            null,
            ''
          )
        })

        o('null leafs', function() {
          checkinline(
            {
              foo: null
            },
            ''
          )
        })

        o('undefined leafs', function() {
          checkinline(
            {
              foo: void 8
            },
            ''
          )
        })

        o('null leafs in array', function() {
          checkinline(
            {
              foo: [null]
            },
            ''
          )
        })

        o('undefined leafs in array', function() {
          checkinline(
            {
              foo: [void 8]
            },
            ''
          )
        })

        o('null leafs in array, preceded by value', function() {
          checkinline(
            {
              foo: ['bar', null]
            },
            'foo:bar;'
          )
        })

        o('undefined leafs in array, preceded by value', function() {
          checkinline(
            {
              foo: ['bar', void 8]
            },
            'foo:bar;'
          )
        })

        o('null leafs in arry, followed by a value', function() {
          checkinline(
            {
              foo: [null, 'bar']
            },
            'foo:bar;'
          )
        })

        o('undefined leafs in arry, followed by a value', function() {
          checkinline(
            {
              foo: [void 8, 'bar']
            },
            'foo:bar;'
          )
        })

        o('undefined value', function() {
          checkinline(
            void 8,
            ''
          )
        })

        o('null in Array', function() {
          checkinline(
            [null],
            ''
          )
        })

        o('undefined in Array', function() {
          checkinline(
            [void 8],
            ''
          )
        })

        o('null in Array followed by object', function() {
          checkinline(
            [null, {
              foo: 'bar'
            }],
            'foo:bar;'
          )
        })

        o('undefined in Array followed by object', function() {
          checkinline(
            [void 8, {
              foo: 'bar'
            }],
            'foo:bar;'
          )
        })

        o('object followed by null in Array', function() {
          checkinline(
            [{
              foo: 'bar'
            }, null],
            'foo:bar;'
          )
        })

        o('object followed by undefined in Array', function() {
          checkinline(
            [{
              foo: 'bar'
            }, void 8],
            'foo:bar;'
          )
        })
      })
    })

    o.spec('sheet', function() {
      o.beforeEach(function(){
        // ensure that we are not sensitive to additions to Object.prototype.
        Object.prototype.BADBAD = 5
      })
      o.afterEach(function() {
        delete Object.prototype.BADBAD
      })

      o.spec('J2c().sheet: ', function() {
        o('direct sheet call', function() {
          check(
            J2c().sheet({
              p: {
                foo: 5
              }
            }),
            'p{foo:5}'
          )
        })
      })

      o.spec('Definitions: ', function() {
        o('basic', function() {
          check(
            J2c().sheet({
              p: {
                foo: 'bar'
              }
            }),
            'p{foo:bar}'
          )
        })

        o('raw', function() {
          o(J2c().sheet('p{color:red}')).equals('p{color:red}\n')
        })

        o('convert underscores', function() {
          check(
            J2c().sheet({
              p: {
                foo_foo: 'bar'
              }
            }),
            'p{foo-foo:bar}'
          )
        })

        o('convert CamelCase', function() {
          check(
            J2c().sheet({
              p: {
                fooFoo: 'bar'
              }
            }),
            'p{foo-foo:bar}'
          )
        })

        o('number values', function() {
          check(
            J2c().sheet({
              p: {
                foo: 5
              }
            }),
            'p{foo:5}'
          )
        })

        o('composed property name', function() {
          check(
            J2c().sheet({
              p: {
                foo: {
                  bar: 'baz'
                }
              }
            }),

            'p{foo-bar:baz}'
          )
        })

        o('composed selector : child with a given class', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  ' .foo': {
                    bar: 'baz'
                  }
                }
              }
            }),

            'p .foo{bar:baz}'
          )
        })

        o('composed selector: add a class to the root', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  '.foo': {
                    bar: 'baz'
                  }
                }
              }
            }),

            'p.foo{bar:baz}'
          )
        })

        o('manual vendor prefixes', function() {
          check(
            J2c().sheet({
              p: {
                _o$_ms$_moz$_webkit$: {
                  foo: 'bar'
                }
              }
            }),

            'p {-o-foo:bar;-ms-foo:bar;-moz-foo:bar;-webkit-foo:bar;foo:bar}'
          )
        })

        o('mixing definitions and sub-selectors', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  foo: 'bar',
                  ' .foo': {
                    bar: 'baz'
                  }
                }
              }
            }),
            'p {foo:bar} p .foo{bar:baz}'
          )
        })
      })

      o.spec('Selector Cartesian product: ', function() {
        o('1 x 2', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  ' .foo': {
                    ':before,:after': {
                      foo: 'bar'
                    }
                  }
                }
              }
            }),

            'p .foo:before, p .foo:after {foo:bar}'
          )
        })

        o('2 x 1', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  ' .foo, .bar': {
                    ':before': {
                      foo: 'bar'
                    }
                  }
                }
              }
            }),

            'p .foo:before, p .bar:before {foo:bar}'
          )
        })

        o('2 x 2', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  ' .foo, .bar': {
                    ':before,:after': {
                      foo: 'bar'
                    }
                  }
                }
              }
            }),

            'p .foo:before, p .bar:before, p .foo:after, p .bar:after {foo:bar}'
          )
        })


        o('2 x 3 one of which is empty', function() {
          check(
            J2c().sheet({
              '@global': {
                p: {
                  ' .foo, .bar': {
                    ',:before,:after': {
                      foo: 'bar'
                    }
                  }
                }
              }
            }),
            'p .foo, p .bar, p .foo:before, p .bar:before, p .foo:after, p .bar:after {foo:bar}'
          )
        })

        o("don't split on comas inside double quoted strings ...", function() {
          check(J2c().sheet({
            'a[foo="bar,baz"]': {
              ' p': {
                qux: 5
              }
            }
          }), 'a[foo="bar,baz"] p {qux: 5}')
        })

        o('... nor split on comas inside single quoted strings ...', function() {
          check(J2c().sheet({
            "a[foo='bar,baz']": {
              ' p': {
                qux: 5
              }
            }
          }), "a[foo='bar,baz'] p {qux: 5}")
        })

        o('... nor split on comas inside comments ...', function() {
          check(J2c().sheet({
            'a/*bar,baz*/': {
              ' p': {
                qux: 5
              }
            }
          }), 'a/*bar,baz*/ p {qux: 5}')
        })

        o('... nor split on comas inside parentheses ...', function() {
          check(J2c().sheet({
            'p:any(a, ul)': {
              ' li': {
                qux: 5
              }
            }
          }), 'p:any(a, ul) li {qux: 5}')
        })

        o('... but split in between', function() {
          check(J2c().sheet({
            'a[foo="bar,baz"], a:any(p, ul), a/*bar,baz*/': {
              ' p': {
                qux: 5
              }
            }
          }), 'a[foo="bar,baz"] p, a:any(p, ul) p, a/*bar,baz*/ p {qux: 5}')
        })
      })

      o.spec('Ampersand: ', function() {
        o('.foo &', function() {
          check(
            J2c().sheet({
              p: {
                ':global(.foo) &': {
                  bar: 'baz'
                }
              }
            }),
            '.foo p{bar:baz}'
          )
        })

        o('& &', function() {
          check(
            J2c().sheet({
              ':global(.foo)': {
                '& &': {
                  bar: 'baz'
                }
              }
            }),
            '.foo .foo{bar:baz}'
          )
        })

        o('& [bar="&"].baz', function() {
          check(
            J2c().sheet({
              ':global(.foo)': {
                '& [bar="&"]:global(.baz)': {
                  qux: 'quux'
                }
              }
            }),
            '.foo [bar="&"].baz{qux:quux}'
          )
        })

        o("& [bar='&'].baz", function() {
          check(
            J2c().sheet({
              ':global(.foo)': {
                '& [bar="&"]:global(.baz)': {
                  qux: 'quux'
                }
              }
            }),
            '.foo [bar="&"].baz{qux:quux}'
          )
        })

        o('& /*&*/.baz', function() {
          check(
            J2c().sheet({
              ':global(.foo)': {
                '&  /*&*/:global(.baz)': {
                  qux: 'quux'
                }
              }
            }),
            '.foo /*&*/.baz{qux:quux}'
          )
        })

        o(' /*&*/.baz', function() {
          check(
            J2c().sheet({
              ':global(.foo)': {
                ' /*&*/:global(.baz)': {
                  qux: 'quux'
                }
              }
            }),
            '.foo /*&*/.baz{qux:quux}'
          )
        })

        o('& &, cartesian product', function() {
          check(
            J2c().sheet({
              'p,a': {
                '& &': {
                  bar: 'baz'
                }
              }
            }),
            'p p,p a,a p,a a {bar:baz}'
          )
        })

        o(' :global(.baz) &, :global(.qux)', function() {
          check(
            J2c().sheet({
              p: {
                ' :global(.foo), :global(.bar)': {
                  ' :global(.baz) &, :global(.qux)': {
                    foo: 'bar'
                  }
                }
              }
            }),
            '.baz p .foo,.baz p .bar,p .foo .qux ,p .bar .qux {foo:bar}'
          )
        })

        o('& in @global context', function() {
          check(
            J2c().sheet({
              '@global': {
                '.foo': {
                  '& &': {
                    bar: 'baz'
                  }
                }
              }
            }),
            '.foo .foo{bar:baz}'
          )
        })
      })

      o.spec('Strings and Arrays: ', function() {
        o('String literal', function() {
          check(
            J2c().sheet({
              p: 'foo:bar'
            }),
            'p{foo:bar}'
          )
        })

        o('String literal with two declarations', function() {
          check(
            J2c().sheet({
              p: 'foo:bar;baz:qux'
            }),
            'p {foo:bar;baz:qux}'
          )
        })

        o('String literal starting with an underscore', function() {
          check(
            J2c().sheet({
              p: '_foo:bar'
            }),
            'p {_foo:bar}'
          )
        })

        o('Array of String literals', function() {
          check(
            J2c().sheet({
              p: ['foo:bar;', 'foo:baz;']
            }),
            'p{foo:bar;foo:baz}'
          )
        })


        o('overloaded properties', function() {
          check(
            J2c().sheet({
              p: {
                foo: ['bar', 'baz']
              }
            }),
            'p{foo:bar;foo:baz}'
          )
        })

        o('overloaded sub-properties', function() {
          check(
            J2c().sheet({
              p: {
                foo: [{
                  bar: 'baz'
                }, {
                  bar: 'qux'
                }]
              }
            }),
            'p{foo-bar:baz;foo-bar:qux}'
          )
        })

        o('nested Arrays', function() {
          check(
            J2c().sheet({
              p: [
                [{
                  bar: 'baz'
                }, {
                  bar: 'qux'
                }],
                'bar:quux;'
              ]
            }),
            'p{bar:baz;bar:qux;bar:quux}'
          )
        })
      })

      o.spec('At-rules: ', function() {
        o('@charset', function() {
          check(
            J2c().sheet({
              '@charset': '"UTF-8"'
            }),

            '@charset "UTF-8";'
          )
        })

        o('@import', function() {
          check(
            J2c().sheet({
              '@import': 'url("bluish.css") projection, tv'
            }),

            '@import url("bluish.css") projection, tv;'
          )
        })

        o('@namespace', function() {
          check(
            J2c().sheet({
              '@namespace': 'prefix url(XML-namespace-URL)'
            }),

            '@namespace prefix url(XML-namespace-URL);'
          )
        })

        o('@media', function() {
          check(
            J2c().sheet({
              p: {
                '@media foo': {
                  bar: 'baz'
                }
              }
            }),

            '@media foo {p{bar:baz}}'
          )
        })

        o('@supports', function() {
          check(
            J2c().sheet({
              '@supports not (text-align-last:justify)': {
                'p': {
                  textAlignLast: 'justify'
                }
              }
            }),

            '@supports not (text-align-last:justify) {p {text-align-last:justify}}'
          )
        })

        o('@page', function() {
          check(
            J2c().sheet({
              '@page :first': {
                margin: '2in 3in'
              }
            }),

            '@page :first {margin: 2in 3in;}'
          )
        })

        o('several @media with object value', function() {
          check(
            J2c().sheet({
              p: {
                '@media foo': {
                  bar: 'baz'
                },
                '@media foo2': {
                  bar2: 'baz2'
                }
              }
            }), [
              '@media foo {p{bar:baz}} @media foo2 {p{bar2:baz2}}'
            ]
          )
        })

        o('Array of @import with text values', function() {
          check(
            J2c().sheet([{
              '@import': "'bar'"
            }, {
              '@import': "'baz'"
            }]),
            "@import 'bar'; @import 'baz';"
          )
        })

        o('nested @media', function() {
          check(
            J2c().sheet({
              p: {
                '@media screen': {
                  width: 1000,
                  '@media (max-width: 12cm)': {
                    size: 5
                  }
                }
              }
            }), [
              '@media screen{p{width:1000}@media (max-width:12cm){p{size:5}}}'
            ]
          )
        })

        o('@font-face', function() {
          check(
            J2c().sheet({
              '@font-face': {
                foo: 'bar'
              }
            }),
            '@font-face{foo:bar}'
          )
        })

        o('@keyframes', function() {
          check(
            J2c().sheet({
              '@keyframes global(qux)': {
                from: {
                  foo: 'bar'
                },
                to: {
                  foo: 'baz'
                }
              }
            }),
            '@keyframes qux{from{foo:bar}to{foo:baz}}'
          )
        })

        o('invalid @foo becomes @-error-unsupported-at-rule "@foo"', function() {
          var err
          try {
            J2c().sheet({
              '@foo': 'bar'
            })
          } catch (e) {
            err = e
          }

          o(err).notEquals(void 8)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @foo */')).notEquals(-1)
          o(err.message.indexOf('"Unsupported at-rule: @foo"')).notEquals(-1)
        })

        o('invalid @ becomes @-error-unsupported-at-rule "@"', function() {
          var err
          try {
            J2c().sheet({
              '@': 'bar'
            })
          } catch (e) {
            err = e
          }

          o(err).notEquals(void 8)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @ */')).notEquals(-1)
          o(err.message.indexOf('"Unsupported at-rule: @"')).notEquals(-1)
        })
      })

      o.spec('At-rules with prefixes: ', function() {
        o('@-webkit-keyframes', function() {
          check(
            J2c().sheet({
              '@-webkit-keyframes global(qux)': {
                from: {
                  foo: 'bar'
                },
                to: {
                  foo: 'baz'
                }
              }
            }),
            '@-webkit-keyframes qux{from{foo:bar}to{foo:baz}}'
          )
        })
      })

      o.spec('At-rules with array values: ', function() {
        o('@font-face with a 1-element array', function() {
          check(
            J2c().sheet({
              '@font-face': [{
                foo: 'bar'
              }]
            }),
            '@font-face{foo:bar}'
          )
        })

        o('@font-face with a 2-elements array', function() {
          check(
            J2c().sheet({
              '@font-face': [{
                foo: 'bar'
              }, {
                foo: 'baz'
              }]
            }),
            '@font-face{foo:bar}@font-face{foo:baz}'
          )
        })

        o('@namespace with a 1-element array', function() {
          check(
            J2c().sheet({
              '@namespace': ["'http://foo.example.com'"]
            }),
            "@namespace 'http://foo.example.com';"
          )
        })

        o('@namespace with a 2-elements array', function() {
          check(
            J2c().sheet({
              '@namespace': ["'http://foo.example.com'", "bar 'http://bar.example.com'"]
            }),
            "@namespace 'http://foo.example.com';@namespace bar 'http://bar.example.com';"
          )
        })
      })

      o.spec('Locals, Globals ', function() {
        var _j2c
        o.beforeEach(function(){
          _j2c = J2c()
        })
        o('a local class', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              foo: 5
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(css.indexOf('.' + names.bit + ' {\nfoo:5;\n}')).notEquals(-1)
        })

        o("a local class in a doubly quoted string shouldn't be localized", function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '[foo=".bit"]': {
              foo: 5
            }
          })
          o(names.bit).equals(undefined)
          check(css, '[foo=".bit"]{foo:5;}')
        })

        o("a local class in a singly quoted string shouldn't be localized", function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            "[foo='.bit']": {
              foo: 5
            }
          })
          o(names.bit).equals(undefined)
          check(css, "[foo='.bit']{foo:5;}")
        })

        o("a local class in a comment shouldn't be localized", function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            'p/*.bit*/': {
              foo: 5
            }
          })
          o(names.bit).equals(undefined)
          check(css, 'p/*.bit*/{foo:5;}')
        })

        o('Mixing strings and comments (regexp validation)', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            "/*'*/.bit/*'*/": {
              foo: 5
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          check(css, "/*'*/." + names.bit + "/*'*/{foo:5;}")
        })

        o('two local classes', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              foo: 5
            },
            '.bat': {
              bar: 6
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals('bat' + _j2c.suffix)
          o(css.indexOf('.' + names.bit + ' {\nfoo:5;\n}')).notEquals(-1)
          o(css.indexOf('.' + names.bat + ' {\nbar:6;\n}')).notEquals(-1)
        })

        o('a local and a global class', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              foo: 5
            },
            ':global(.bat)': {
              bar: 6
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals(undefined)
          o(css.indexOf('.' + names.bit + ' {\nfoo:5;\n}')).notEquals(-1)
          o(css.indexOf('.bat {\nbar:6;\n}')).notEquals(-1)
        })

        o('a local wrapping a global block', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              '@global': {
                '.bat': {
                  foo: 5
                }
              }
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals(undefined)
          o(css.indexOf('.' + names.bit + '.bat {\nfoo:5;\n}')).notEquals(-1)
        })

        o('two local classes, nested', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              foo: 5,
              '.bat': {
                bar: 6
              }
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals('bat' + _j2c.suffix)
          o(css.indexOf('.' + names.bit + ' {\nfoo:5;\n}')).notEquals(-1)
          o(css.indexOf('.' + names.bit + '.' + names.bat + ' {\nbar:6;\n}')).notEquals(-1)
        })

        o('@keyframes', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '@keyframes bit': {}
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(css.indexOf('@keyframes ' + names.bit + ' {')).notEquals(-1)
        })

        o('@keyframes with a CSS variable as name', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '@keyframes var(--foo)': {}
          })
          o(names.hasOwnProperty('var')).equals(false)
          o(css.indexOf('@keyframes var(--foo) {')).notEquals(-1)
        })

        o('a global @keyframes', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '@keyframes global(bit)': {}
          })
          o(names.bit).equals(undefined)
          o(css.indexOf('@keyframes bit {')).notEquals(-1)
        })

        o('a @keyframe nested in a @global at-rule', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '@global': {
              '@keyframes bat': {
                'from': {
                  foo: 6
                }
              }
            }
          })
          o(names.bat).equals(undefined)
          o(css.indexOf('@keyframes bat {')).notEquals(-1)
        })

        o('one animation', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation: 'bit 1sec'
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(css.indexOf('animation:' + names.bit + ' ')).notEquals(-1)
        })

        o('a global animation', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation: 'global(bit) 1sec'
            }
          })
          o(names.bit).equals(undefined)
          o(css.indexOf('animation:bit ')).notEquals(-1)
        })

        o('an animation nested in a @global at-rule', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '@global': {
              p: {
                animation: 'bit 1sec'
              }
            }
          })
          o(names.bit).equals(undefined)
          o(css.indexOf('animation:bit ')).notEquals(-1)
        })

        o('one animation with a CSS variable', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation: 'var(--foo) 1sec'
            }
          })
          o(names.hasOwnProperty('var')).equals(false)
          o(css.indexOf('animation:var(--foo) 1sec;')).notEquals(-1)
        })
        o('one animation without a name', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation: '1sec ease'
            }
          })
          o(names.hasOwnProperty('ease')).equals(false)
          o(names.hasOwnProperty('sec')).equals(false)
          o(css.indexOf('animation:1sec ease;')).notEquals(-1)
        })

        o('one animation-name', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation_name: 'bit'
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(css.indexOf('animation-name:' + names.bit + ';')).notEquals(-1)
        })

        o('two animation-name', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation_name: 'bit, bat'
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals('bat' + _j2c.suffix)
          o(css.indexOf('animation-name:' + names.bit + ',' + names.bat)).notEquals(-1)
        })

        o('two animation-name, one global', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation_name: 'bit, global(bat)'
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals(undefined)
          o(css.indexOf('animation-name:' + names.bit + ',bat;')).notEquals(-1)
        })

        o('one animation-name with a CSS variable', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            p: {
              animation_name: 'var(--foo)'
            }
          })
          o(names.hasOwnProperty('var')).equals(false)
          o(css.indexOf('animation-name:var(--foo);')).notEquals(-1)
        })

        o('a nested @global at-rule', function() {
          var names = _j2c.names
          var css = _j2c.sheet({
            '.bit': {
              '@global': {
                '.bat': {
                  'foo': 6
                }
              }
            }
          })
          o(names.bit).equals('bit' + _j2c.suffix)
          o(names.bat).equals(undefined)
          o(css.indexOf(names.bit + '.bat {')).notEquals(-1)
        })

        o('a @local rule nested in a @global block', function() {
          check(
            J2c().sheet({
              '@global': {
                '.bit': {
                  '@local': {
                    ':global(.bat)': {
                      'foo': 6
                    }
                  }
                }
              }
            }),
            '.bit.bat {foo:6}'
          )
        })
      })
    })



    o.spec('Order: ', function() {
      o.beforeEach(function(){
        // ensure that we are not sensitive to additions to Object.prototype.
        Object.prototype.BADBAD = 5
      })
      o.afterEach(function() {
        delete Object.prototype.BADBAD
      })


      o('two properties', function() {
        check(J2c().sheet({
          p: {
            foo: 'bar',
            baz: 'qux'
          }
        }), 'p {\nfoo:bar;\nbaz:qux;\n}')
      })

      o('$ combiner', function() {
        check(J2c().sheet({
          p: {
            foo$baz: 'qux'
          }
        }), 'p {\nfoo:qux;\nbaz:qux;\n}')
      })

      o('source order is respected when mixing declarations, subselectors and at rules', function() {
        var prop = randStr()
        var klass = randStr()
        var width = randInt()

        var permutations = [
          [0, 1, 2],
          [1, 2, 0],
          [2, 0, 1],
          [2, 1, 0],
          [0, 2, 1],
          [1, 0, 2]
        ]

        var jsKeys = [
          prop,
          '.' + klass,
          '@media (min-width: ' + width + 'em)'
        ]

        var x = {}
        x[prop] = 5
        x['.' + klass] = {
          foo: 6
        }
        x['@media (min-width: ' + width + 'em)'] = {
          bar: 7
        }

        var rules = [
          'p{' + prop + ':5;}',
          'p.' + klass + '{foo:6;}',
          '@media (min-width: ' + width + 'em){p{bar:7;}}'
        ]

        var J2c_1 = J2c()

        // This second instance ensures that we don't rely on the falsy return value
        // of the default buffer methods.
        // This happens in this test because it vists most if not all of the code paths
        // where this may be relevant, especially in `src/sheet.js`.
        var J2c_2 = J2c({
          filter: function(next) {
            return {
              done: next.done,
              init: function() {
                next.init.apply(next, arguments)
                return true
              },
              atrule: function() {
                next.atrule.apply(next, arguments)
                return true
              },
              _atrule: function() {
                next._atrule.apply(next, arguments)
                return true
              },
              decl: function() {
                next.decl.apply(next, arguments)
                return true
              },
              rule: function() {
                next.rule.apply(next, arguments)
                return true
              },
              _rule: function() {
                next._rule.apply(next, arguments)
                return true
              }
            }
          }
        })


        permutations.forEach(function(indices) {
          var source = {
            p: {}
          }
          var CSS = []
          indices.forEach(function(i) {
            source.p[jsKeys[i]] = x[jsKeys[i]]
            CSS.push(rules[i])
          })
          o(normalize(J2c_1.sheet({
            '@global': source
          }))).equals(normalize(CSS.join('')))
          o(normalize(J2c_2.sheet({
            '@global': source
          }))).equals(normalize(CSS.join('')))
        })
      })

      o('@namespace then selector', function() {
        check(J2c().sheet({
          '@namespace': "'foo'",
          p: {
            foo: 'bar'
          }
        }), "@namespace 'foo';p{foo:bar;}")
      })
    })

    o.spec('Plugins: ', function() {
      o.beforeEach(function(){
        // ensure that we are not sensitive to additions to Object.prototype.
        Object.prototype.BADBAD = 5
      })
      o.afterEach(function() {
        delete Object.prototype.BADBAD
      })

      o.spec('Misc: ', function() {
        o('an empty array as plugin', function() {
          check(
            J2c([]).sheet({
              p: {
                color: 'red'
              }
            }),
            'p{color:red;}'
          )
        })

        o('an null plugin', function() {
          check(
            J2c(null).sheet({
              p: {
                color: 'red'
              }
            }),
            'p{color:red;}'
          )
        })

        o('an invalid plugin name', function() {
          var _J2c = J2c({
            invalid: 'foo'
          })
          check(
            _J2c.sheet({
              p: {
                color: 'red'
              }
            }),
            'p{color:red;}'
          )
          o(_J2c.hasOwnProperty('invalid')).equals(false)
        })

        o('a plugin that sets a property on the instance that already exists', function() {
          var _J2c = J2c({
            sheet: 'foo'
          })
          o(_J2c.sheet).notEquals('foo')
          check(
            _J2c.sheet({
              p: {
                color: 'red'
              }
            }),
            'p{color:red;}'
          )

          o(_J2c.sheet).notEquals('foo')
        })
      })

      o.spec('filter plugins', function() {
        o('a sheet filter', function() {
          var tested = {}
          var filter = {
            filter: function(next, inline) {
              o(next instanceof Object).equals(true)('value should have been a Object')
              o(next.init instanceof Function).equals(true)('value should have been a Function')
              o(next.done instanceof Function).equals(true)('value should have been a Function')
              o(next.decl instanceof Function).equals(true)('value should have been a Function')
              o(next.err instanceof Function).equals(true)('value should have been a Function')
              if (!inline) {
                o(next.rule instanceof Function).equals(true)('value should have been a Function')
                o(next._rule instanceof Function).equals(true)('value should have been a Function')
                o(next.atrule instanceof Function).equals(true)('value should have been a Function')
                o(next._atrule instanceof Function).equals(true)('value should have been a Function')
              }

              return {
                init: function() {
                  next.init()
                  o(!!inline).equals(false)
                },
                done: function() {
                  var buf = next.done(1)

                  o(buf instanceof Array).equals(true)('value should have been a Array')

                  o(buf.length).notEquals(0)
                  var txt = next.done()

                  o(typeof txt).equals('string')('value should have been a string')

                  return txt
                },
                atrule: function(name, kind, arg, hasBlock) {
                  if (kind === 'import' && (tested.atImport = true)) o(!!hasBlock).equals(false)
                  if (kind === 'keyframes' && (tested.atKeyframes = true)) o(hasBlock).equals('rule')
                  next.atrule(name + 'o', kind, 'a' + arg, hasBlock)
                },
                _atrule: function(name, arg) {
                  next._atrule(name + 'o', 'a' + arg)
                },
                decl: function(prop, value) {
                  next.decl('p' + prop, 'v' + value)
                },
                rule: function(selector) {
                  next.rule('h1, ' + selector)
                },
                _rule: function() {
                  next._rule()
                }
              }
            }
          }

          check(
            J2c({plugins: [filter]}).sheet({
              '@global': {
                '@import': 'foo',
                p: {
                  foo: 'bar'
                },
                '@keyframes foo': {
                  from: {
                    foo: 'baz'
                  }
                }
              }
            }),
            '@importo afoo;' +
            'h1, p {pfoo:vbar}' +
            '@keyframeso afoo{h1, from{pfoo:vbaz}}'
          )
          o(tested.atImport).equals(true)
          o(tested.atKeyframes).equals(true)

        })

        o('a declaration filter', function() {
          var plugin = {
            filter: function(next, inline) {
              o(next instanceof Object).equals(true)('value should have been a Object')
              o(next.init instanceof Function).equals(true)('value should have been a Function')
              o(next.done instanceof Function).equals(true)('value should have been a Function')
              o(next.decl instanceof Function).equals(true)('value should have been a Function')
              if (!inline) {
                o(next.rule instanceof Function).equals(true)('value should have been a Function')
                o(next._rule instanceof Function).equals(true)('value should have been a Function')
                o(next.atrule instanceof Function).equals(true)('value should have been a Function')
                o(next._atrule instanceof Function).equals(true)('value should have been a Function')
              }

              return {
                init: function() {
                  next.init()
                  o(!!inline).equals(true)
                },
                done: function() {
                  var buf = next.done(true)
                  o(buf instanceof Array).equals(true)('value should have been a Array')
                  o(buf.length).notEquals(0)
                  var txt = next.done()
                  o(typeof txt).equals('string')('value should have been a string')
                  return txt
                },
                decl: function(prop, value) {
                  next.decl('p' + prop, 'v' + value)
                }
              }
            }
          }
          check(
            J2c({plugins: [plugin]}).inline({
              foo: 'bar'
            }),
            'pfoo:vbar;'
          )
        })

        o('filter order', function() {
          var acc = []

          function filter(x) {
            return {
              filter: function(next) {
                return {
                  rule: function() {
                    acc.push(x)
                    return next.rule.apply(next, arguments)
                  }
                }
              }
            }
          }
          J2c({plugins: [filter(1), filter(2)]}).sheet({
            '.foo': 'bar:baz;'
          })
          o(acc.length).equals(2)
          o(acc[0]).equals(1)
          o(acc[1]).equals(2)
        })

        o('filter default', function() {
          var acc = []
          check(
            J2c({plugins: [{
              filter: function(next) {
                return {
                  rule: function(selector) {
                    acc.push(selector)
                    return next.rule(selector + 're')
                  }
                }
              }
            }]}).sheet({
              'p': 'bar:baz;'
            }),
            'pre{bar:baz}'
          )
          o(acc.length).equals(1)
          o(acc[0]).equals('p')
        })
      })

      o.spec('atrule plugins', function() {
        o('one atrule plugin', function() {
          function plugin(name) {
            return {
              atrule: function(walker, emit, match, v, prefix, local, depth) {
                o(match instanceof Array).equals(true)('value should have been a Array')
                o(walker instanceof Object).equals(true)('value should have been a Object')
                o(walker.hasOwnProperty('atruleHandlers')).equals(true)
                o(walker.hasOwnProperty('localize')).equals(true)
                o(walker.hasOwnProperty('localizeReplacer')).equals(true)
                o(walker.hasOwnProperty('names')).equals(true)

                o(emit instanceof Object).equals(true)('value should have been a Object')
                o(emit.hasOwnProperty('atrule')).equals(true)

                o(v).equals('param')

                o(typeof prefix).equals('string')('value should have been a string')
                  // `local` can be many things, the only things that matters is its truthiness
                o(!!local).equals(true)
                  // `inAtRule` can be many things, the only things that matters is its truthiness
                o(depth).equals(0)

                if (match[2] !== name) return false
                emit.atrule(match[1], match[2], v)
                return true
              }
            }
          }
          var _j2c = J2c({plugins: [plugin('foo')]})
          check(
            _j2c.sheet({
              '@foo': 'param'
            }),
              '@foo param;'
            )
          var err
          try {
            _j2c.sheet({
              '@foo': 'param',
              '@bar': 'param',
              '@baz': 'param'
            })
          } catch (e) {
            err = e
          }
          o(err).notEquals(undefined)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @bar */')).notEquals(-1)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @baz */')).notEquals(-1)
        })

        o('two atrule plugins', function() {
          function plugin(name) {
            return {
              atrule: function(walker, emit, match, v) {
                if (match[2] !== name) return false
                emit.atrule(match[1], match[2], v)
                return true
              }
            }
          }
          var _j2c = J2c({plugins: [plugin('foo'), plugin('bar')]})
          check(
            _j2c.sheet({
              '@foo': 'param',
              '@bar': 'param'
            }),
              '@foo param; @bar param;'
            )
          var err
          try {
            _j2c.sheet({
              '@foo': 'param',
              '@bar': 'param',
              '@baz': 'param'
            })
          } catch (e) {
            err = e
          }
          o(err).notEquals(undefined)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @bar */')).equals(-1)
          o(err.message.indexOf('/* +++ ERROR +++ Unsupported at-rule: @baz */')).notEquals(-1)

        })

        o('atrule plugin has precedence over default at-rules', function() {
          var plugin = {
            atrule: function(walker, emit, match, v) {
              if (match[2] !== 'import') return false
              emit.atrule('@intercepted', 'intercepted', v)
              return true
            }
          }

          check(
            J2c({plugins: [plugin]}).sheet({
              '@import': 'foo'
            }),
            '@intercepted foo;'
          )
        })

        o('atrule plugin that verifies malformed rules are properly passed unparsed', function() {
          var plugin = {
            atrule: function(walker, emit, match, v) {

              o(match[0]).equals('@; hey')
              o(match[1]).equals('@')
              o(match[2]).equals('')
              o(match[3]).equals('')
              o(v).equals('foo')
              return true
            }
          }

          check(
            J2c({plugins: [plugin]}).sheet({
              '@; hey': 'foo'
            }),
            ''
          )
        })
      })
    })
  })
}) // DONE!





// TODO
//
// - spy on String.prototype.replace and RegExp.prototype.*
//   to generate coverage reports for the branches hidden
//   in these native functions.
//
// - verify that all at-rules behave properly in filters
//   (wrt selectors and definitions)
//
// - test `inAtRule` from atrule plugins (is it set appropriately?)
//
// - test @keyframes nested in selector scope