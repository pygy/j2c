var o = require('../test-utils/ospec-instance')

var upToDate = require('../test-utils/misc').upToDate

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var makeSink = require('../test-utils/misc').makeSink
var mocks = require('../test-utils/mocks')

var blankFixers = exposed.blankFixers
var createPrefixPlugin = exposed.createPrefixPlugin
var hasCleanState = exposed.hasCleanState
var initBrowser = exposed.initBrowser

var referenceFixers = Object.keys(blankFixers())

o.spec('plugin misc tests', function() {
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

  o('build up to date', function() {
    o(upToDate(__dirname, '../src/plugin.js')).equals(true)
    o(upToDate(__dirname, '../src/fixers.js')).equals(true)
  })

  o('handles raw declarations and bad values gracefully', function() {
    mocks(global, {properties: {'-o-foo': 'bar'}})
    initBrowser()

    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({})
    methods.decl('foo', 5)
    methods.decl('bar', null)
    methods.decl('-baz', global)
    methods.decl(null, global)
    methods.decl('', 'qux')

    o(sink.buffer).deepEquals([
        ['decl', '-o-foo', '5'],
        ['decl', 'bar', null],
        ['decl', '-baz', global],
        ['decl', null, global],
        ['decl', '', 'qux']
    ])
    o(fixers.properties).deepEquals({
      'foo': '-o-foo', 'bar': 'bar', '': ''
    })
  })
})