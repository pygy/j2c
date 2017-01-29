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



o.spec('plugin.decl for properties', function() {
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
    plugin.set.setPrefixDb(fixers) // set it a second time to exercise the cache branch.
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('foo', 'bar')

    o(sink.buffer).deepEquals([['decl', 'foo', 'bar']])
    o(fixers.properties).deepEquals({'foo': 'foo'})
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

    methods.decl('foo', 'bar')
    methods.decl('baz', 'qux')

    o(sink.buffer).deepEquals([
        ['decl', '-o-foo', 'bar'],
        ['decl', 'baz', 'qux']
    ])

    o(fixers.properties).deepEquals({
      'foo': '-o-foo',
      'baz': 'baz'
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

    methods.decl('foo', 'bar')
    methods.decl('baz', 'qux')

    o(sink.buffer).deepEquals([
        ['decl', 'foo', 'bar'],
        ['decl', 'baz', 'qux']
    ])

    o(fixers.properties).deepEquals({
      'foo': 'foo',
      'baz': 'baz'
    })
  })
  o('with flexbox 2009, `flex-direction` becomes box-orient + box-direction', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties['box-orient'] = '-o-box-orient'
    fixers.properties['box-direction'] = '-o-box-direction'
    fixers.flexbox2009 = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction'
    })

    methods.decl('flex-direction', 'column-reverse')

    o(sink.buffer).deepEquals([
        ['decl', '-o-box-orient', 'block-axis'],
        ['decl', '-o-box-direction', 'reverse']
    ])

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction'
    })
  })
  o('with flexbox 2009, `flex-flow` becomes box-orient + box-direction + box-lines', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties['box-orient'] = '-o-box-orient'
    fixers.properties['box-direction'] = '-o-box-direction'
    fixers.properties['flex-wrap'] = '-o-box-lines'
    fixers.keywords['flex-wrap'] = {wrap:'multiple'}
    fixers.hasKeywords = true
    fixers.flexbox2009 = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })
    // The extra space between the values is intentional
    methods.decl('flex-flow', 'column-reverse  wrap')

    o(sink.buffer).deepEquals([
        ['decl', '-o-box-orient', 'block-axis'],
        ['decl', '-o-box-direction', 'reverse'],
        ['decl', '-o-box-lines', 'multiple']
    ])

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })
  })
  o('with flexbox 2009, `flex-flow` (no wrap value) becomes box-orient + box-direction', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties['box-orient'] = '-o-box-orient'
    fixers.properties['box-direction'] = '-o-box-direction'
    fixers.properties['flex-wrap'] = '-o-box-lines'
    fixers.keywords['flex-wrap'] = {wrap:'multiple'}
    fixers.hasKeywords = true
    fixers.flexbox2009 = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })

    methods.decl('flex-flow', 'row')

    o(sink.buffer).deepEquals([
        ['decl', '-o-box-orient', 'inline-axis'],
        ['decl', '-o-box-direction', 'normal']
    ])

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })
  })
  o('with flexbox 2009, `flex-flow` (no direction) box-lines', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties['box-orient'] = '-o-box-orient'
    fixers.properties['box-direction'] = '-o-box-direction'
    fixers.properties['flex-wrap'] = '-o-box-lines'
    fixers.keywords['flex-wrap'] = {nowrap:'single'}
    fixers.hasKeywords = true
    fixers.flexbox2009 = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })

    methods.decl('flex-flow', 'nowrap')

    o(sink.buffer).deepEquals([
        ['decl', '-o-box-lines', 'single']
    ])

    o(fixers.properties).deepEquals({
      'box-orient': '-o-box-orient',
      'box-direction': '-o-box-direction',
      'flex-wrap': '-o-box-lines'
    })
  })
  o('with flexbox 2009, non-flexbox properties work as well', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties['foo'] = '-o-foo'
    fixers.hasKeywords = true
    fixers.flexbox2009 = true

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    o(fixers.properties).deepEquals({
      'foo': '-o-foo'
    })

    methods.decl('foo', '5')
    methods.decl('bar', '6')
    o(sink.buffer).deepEquals([
        ['decl', '-o-foo', '5'],
        ['decl', 'bar', '6']
    ])

    o(fixers.properties).deepEquals({
      'foo': '-o-foo',
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

    methods.decl('foo', 'bar')
    methods.decl('baz', 'qux')

    o(sink.buffer).deepEquals([
        ['decl', 'replaced', 'bar'],
        ['decl', 'replaced', 'qux']
    ])

    o(fixers.properties).deepEquals({})

  })
})