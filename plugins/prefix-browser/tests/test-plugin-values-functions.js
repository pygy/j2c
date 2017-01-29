var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var makeSink = require('../test-utils/misc').makeSink
var mocks = require('../test-utils/mocks')

var blankFixers = exposed.blankFixers
var createPrefixPlugin = exposed.createPrefixPlugin
var hasCleanState = exposed.hasCleanState
var initBrowser = exposed.initBrowser

var referenceFixers = Object.keys(blankFixers())

o.spec('plugin.decl for values that have functions', function() {
  var fixers

  o.beforeEach(function() {
    o(hasCleanState()).equals(true)('detector utils state isn\'t clean')
    fixers = blankFixers()
  })
  o.afterEach(function() {
    cleanupIfNeeded(exposed)
    o(Object.keys(fixers)).deepEquals(referenceFixers)
    fixers = null
  })

  o('leaves unknown functions alone', function() {
    mocks(global)
    initBrowser()

    fixers.functions = ['linear-gradient', 'repeating-linear-gradient', 'calc', 'element', 'cross-fade']
    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('foo', 'color(red a(0))')

    o(sink.buffer).deepEquals([['decl', 'foo', 'color(red a(0))']])
  })
  o('fixes known functions', function() {
    mocks(global)
    initBrowser()

    fixers.functions = ['linear-gradient', 'repeating-linear-gradient', 'calc', 'element', 'cross-fade']
    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('foo', 'cross-fade(linear-gradient(89deg red, green),repeating-linear-gradient(-20deg rgb( calc(2 * var(--foo)), 0, 0), green))')
    methods.decl('foo', 'linear-gradient(100deg red, green)')

    o(sink.buffer).deepEquals([
      ['decl', 'foo', '-o-cross-fade(-o-linear-gradient(1deg red, green),-o-repeating-linear-gradient(110deg rgb( -o-calc(2 * var(--foo)), 0, 0), green))'],
      ['decl', 'foo', '-o-linear-gradient(-10deg red, green)']
    ])
  })
  o('skips the gradient fixer if none are present (see coverage)', function() {
    mocks(global)
    initBrowser()

    fixers.functions = ['calc', 'element', 'cross-fade']
    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('foo', 'cross-fade(linear-gradient(89deg red, green),repeating-linear-gradient(-20deg rgb( calc(2 * var(--foo)), 0, 0), green))')
    methods.decl('foo', 'linear-gradient(100deg red, green)')

    o(sink.buffer).deepEquals([
      ['decl', 'foo', '-o-cross-fade(linear-gradient(89deg red, green),repeating-linear-gradient(-20deg rgb( -o-calc(2 * var(--foo)), 0, 0), green))'],
      ['decl', 'foo', 'linear-gradient(100deg red, green)']
    ])
  })
})


