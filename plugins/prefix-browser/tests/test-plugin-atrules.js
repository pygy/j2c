var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var makeSink = require('../test-utils/misc').makeSink

var blankFixers = exposed.blankFixers
var createPrefixPlugin = exposed.createPrefixPlugin
var hasCleanState = exposed.hasCleanState

var referenceFixers = Object.keys(blankFixers())



o.spec('plugin.atrules', function() {
  var fixers

  o.beforeEach(function() {
    o(hasCleanState()).equals(true)('detector utils state isn\'t clean')
    fixers = blankFixers()
  })
  o.afterEach(function() {
    cleanupIfNeeded(exposed)
    o(Object.keys(fixers)).deepEquals(referenceFixers)
  })

  o('works with a blank fixer object', function() {
    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@keyframes', 'keyframes', 'foo', true)

    o(sink.buffer).deepEquals([['atrule', '@keyframes', 'keyframes', 'foo', true]])
  })
  o('with a prefix and hasAtrules set to true, leaves unknowed rules alone', function() {
    fixers.prefix = '-o-'
    fixers.hasAtrules = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@keyframes', 'keyframes', 'foo', true)

    o(sink.buffer).deepEquals([['atrule', '@keyframes', 'keyframes', 'foo', true]])
  })
  o('modifies known rules according to fixers.atrules', function() {
    fixers.atrules['@foo'] = '@-o-foo'
    fixers.prefix = '-o-'
    fixers.hasAtrules = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@foo', 'foo', 'bar', true)

    o(sink.buffer).deepEquals([['atrule', '@-o-foo', 'foo', 'bar', true]])
  })
})