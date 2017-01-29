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

o.spec('plugin.decl for complex values', function() {
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

  o('transition with a prefixed property and a prefixed function', function() {
    mocks(global, {properties: {'-o-foo': 'bar'}})
    initBrowser()

    fixers.functions = ['linear-gradient', 'repeating-linear-gradient', 'calc', 'element', 'cross-fade']
    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('transition', 'bar 1s, foo 2s step(calc(3 * var(--foo)), foo)')

    o(sink.buffer).deepEquals([
      ['decl', 'transition', 'bar 1s,-o-foo 2s step(-o-calc(3 * var(--foo)), foo)']
    ])
  })
})
