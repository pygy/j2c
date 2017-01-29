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

o.spec('plugin.decl for properties whose values are properties', function() {
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

  o('it leaves unknowned properties as is', function() {
    mocks(global, {properties: {'-o-foo': null, 'foo': null}})
    initBrowser()
    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({})

    methods.decl('transition', 'bar 1s step(0.5s, foo)')
    methods.decl('transition', 'bar 1s, baz 2s')

    o(sink.buffer).deepEquals([
      ['decl', 'transition', 'bar 1s step(0.5s, foo)'],
      ['decl', 'transition', 'bar 1s,baz 2s']
    ])

    o(fixers.properties).deepEquals({
      'transition': 'transition',
      'bar': 'bar',
      'baz': 'baz'
    })
  })
  o('adds prefixes when necessary', function() {
    mocks(global, {properties: {'-o-foo': 'bar'}})
    initBrowser()

    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({})

    methods.decl('transition', 'foo 1s')
    methods.decl('transition', 'bar 1s, foo 2s step(0.5s, foo)')

    o(sink.buffer).deepEquals([
      ['decl', 'transition', '-o-foo 1s'],
      ['decl', 'transition', 'bar 1s,-o-foo 2s step(0.5s, foo)']
    ])

    o(fixers.properties).deepEquals({
      'transition': 'transition',
      'foo': '-o-foo',
      'bar': 'bar'
    })
  })
  o('doesn\'t prefix when both prefix an unprefixed are supported', function() {
    mocks(global, {properties: {'-o-foo': 'bar', 'foo': 'bar'}})
    initBrowser()

    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({})

    methods.decl('transition', 'foo 1s')
    methods.decl('transition', 'bar 1s, foo 2s step(0.5s, foo)')

    o(sink.buffer).deepEquals([
      ['decl', 'transition', 'foo 1s'],
      ['decl', 'transition', 'bar 1s,foo 2s step(0.5s, foo)']
    ])

    o(fixers.properties).deepEquals({
      'transition': 'transition',
      'foo': 'foo',
      'bar': 'bar'
    })
  })
  o('the properties fixer can be specified manually', function(){
    fixers.fixProperty = function() {return 'replaced'}
    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({})

    methods.decl('transition', 'foo 1s')
    methods.decl('transition', 'bar 1s, foo 2s step(0.5s, foo)')

    o(sink.buffer).deepEquals([
      ['decl', 'replaced', 'replaced 1s'],
      ['decl', 'replaced', 'replaced 1s,replaced 2s step(0.5s, foo)']
    ])

    o(fixers.properties).deepEquals({})
  })
})