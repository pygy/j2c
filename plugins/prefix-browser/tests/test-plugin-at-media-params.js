var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var makeSink = require('../test-utils/misc').makeSink

var blankFixers = exposed.blankFixers
var createPrefixPlugin = exposed.createPrefixPlugin
var hasCleanState = exposed.hasCleanState

var referenceFixers = Object.keys(blankFixers())



o.spec('plugin @media parameters', function() {
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

    methods.atrule('@media', 'media', 'screen', true)

    o(sink.buffer).deepEquals([['atrule', '@media', 'media', 'screen', true]])
  })

  o('works with no dppx support', function() {
    fixers.hasDppx = false
    fixers.prefix = '-dummy-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@media', 'media', 'screen', true)
    methods.atrule('@media', 'media', '(resolution:2dppx) and (min-resolution:1dppx) and (max-resolution:2.5dppx)', true)
    methods.atrule('@media', 'media', '(resolution:1dppx) and (min-resolution:2dppx) and (max-resolution:1.5dppx)', true)

    o(sink.buffer).deepEquals([
      ['atrule', '@media', 'media', 'screen', true],
      ['atrule', '@media', 'media', '(resolution:192dpi) and (min-resolution:96dpi) and (max-resolution:240dpi)', true],
      ['atrule', '@media', 'media', '(resolution:96dpi) and (min-resolution:192dpi) and (max-resolution:144dpi)', true]
    ])
  })
  o('works with dppx support', function() {
    fixers.hasDppx = true
    fixers.prefix = '-dummy-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@media', 'media', '(resolution:2dppx) and (min-resolution:1dppx) and (max-resolution:2.5dppx)', true)

    o(sink.buffer).deepEquals([['atrule', '@media', 'media', '(resolution:2dppx) and (min-resolution:1dppx) and (max-resolution:2.5dppx)', true]])
  })
  o('works in webkit-like configuration', function() {
    fixers.hasDppx = false
    fixers.hasPixelRatio = true
    fixers.prefix = '-webkit-'
    fixers.properties['resolution'] = '-webkit-device-pixel-ratio'
    fixers.properties['min-resolution'] = '-webkit-min-device-pixel-ratio'
    fixers.properties['max-resolution'] = '-webkit-max-device-pixel-ratio'


    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@media', 'media', '(resolution:2dppx) and (min-resolution:1dppx) and (max-resolution:2.5dppx)', true)

    o(sink.buffer).deepEquals([['atrule', '@media', 'media', '(-webkit-device-pixel-ratio:2) and (-webkit-min-device-pixel-ratio:1) and (-webkit-max-device-pixel-ratio:2.5)', true]])
  })
  o('works in opera-like configuration', function() {
    fixers.hasDppx = false
    fixers.hasPixelRatioFraction = true
    fixers.prefix = '-o-'
    fixers.properties['resolution'] = '-o-device-pixel-ratio'
    fixers.properties['min-resolution'] = '-o-min-device-pixel-ratio'
    fixers.properties['max-resolution'] = '-o-max-device-pixel-ratio'


    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@media', 'media', '(resolution:2dppx) and (min-resolution:1dppx) and (max-resolution:2.51dppx)', true)

    o(sink.buffer).deepEquals([['atrule', '@media', 'media', '(-o-device-pixel-ratio:20/10) and (-o-min-device-pixel-ratio:10/10) and (-o-max-device-pixel-ratio:25/10)', true]])
  })
})