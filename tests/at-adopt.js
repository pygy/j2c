var o = require('../test-utils/ospec-instance')

var J2c = require('../dist/j2c.commonjs')
var sink = require('../test-utils/sinks').simple

o.spec('@adopt: ', function() {
  var j2c
  o.beforeEach(function() {
    j2c = J2c()
  })
  o('basic usage', function() {
    o(j2c.sheet({
      '@adopt foo': 'bar'
    })).equals('')
    o(j2c.names.hasOwnProperty('foo')).equals(true)
    o(j2c.names.foo).equals('foo' + j2c.suffix + ' bar')
  })

  o('basic usage (with dots)', function() {
    o(j2c.sheet({
      '@adopt .foo': '.bar'
    })).equals('')
    o(j2c.names.hasOwnProperty('foo')).equals(true)
    o(j2c.names.foo).equals('foo' + j2c.suffix + ' bar')
  })

  o('array of adoptees', function() {
    o(j2c.sheet({
      '@adopt foo': ['.bar', 'baz']
    })).equals( '')
    o(j2c.names.hasOwnProperty('foo')).equals(true)
    o(j2c.names.foo).equals('foo' + j2c.suffix + ' bar baz')
  })

  o('bad target name', function() {
    var err

    try {
      j2c.sheet({
        '@adopt /foo': '.bar'
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adopter "/foo" in @adopt /foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('/foo')).equals(false)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('bad parameter name', function() {
    var err

    try {
      j2c.sheet({
        '@adopt foo': '/bar'
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee "/bar" in @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('bad parameter: null', function() {
    var err

    try {
      j2c.sheet({
        '@adopt foo': null
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee null in @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('bad parameter: [null]', function() {
    var err

    try {
      j2c.sheet({
        '@adopt foo': [null]
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee null in @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('bad parameter: undefined', function() {
    var err

    try {
      j2c.sheet({
        '@adopt foo': void 8
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee undefined in @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('bad parameter: [undefined, null]', function() {
    var err

    try {
      j2c.sheet({
        '@adopt foo': [void 8, null]
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee undefined in @adopt foo */')).notEquals(-1)
    o(err.message.indexOf('/* +++ ERROR +++ bad adoptee null in @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('forbidden in global scope', function() {
    var err

    try {
      j2c.sheet({
        '@global': {
          '@adopt foo': 'bar'
        }
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ @adopt global or nested: @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('forbidden in conditional scope', function() {
    var err

    try {
      j2c.sheet({
        '@media screen': {
          '@adopt foo': 'bar'
        }
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ @adopt global or nested: @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })

  o('forbidden in selector', function() {
    var err

    try {
      j2c.sheet({
        'p': {
          '@adopt foo': 'bar'
        }
      })
    } catch (e) {
      err = e
    }

    o(err).notEquals(void 8)
    o(err.message.indexOf('/* +++ ERROR +++ @adopt global or nested: @adopt foo */')).notEquals(-1)
    o(j2c.names.hasOwnProperty('foo')).equals(false)
  })
  o('defining a local after @adopting doesn\'t erase the adopted name', function() {
    j2c = J2c({plugins:[sink]})
    o(j2c.sheet({
      '@adopt foo': 'bar'
    })).deepEquals([])
    o(j2c.names.hasOwnProperty('foo')).equals(true)
    o(j2c.names.foo).equals('foo' + j2c.suffix + ' bar')

    var css = j2c.sheet({'.foo': {color: 'red'}})

    o(j2c.names.foo).equals('foo' + j2c.suffix + ' bar')
    o(css).deepEquals([
      ['rule', '.foo'+j2c.suffix],
        ['decl', 'color', 'red'],
      ['_rule']
    ])
  })
})
