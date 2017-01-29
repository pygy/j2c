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

var prefixedKeywords = {}
var unPrefixedKeywords = {}
exposed.keywords.forEach(function(k) {
  var valueMap = k.values.reduce(function(acc,v){
    acc[v] = '-o-' + v
    return acc
  },{})
  k.props.forEach(function(p){
    unPrefixedKeywords[p] = {}
    prefixedKeywords[p] = valueMap
  })
})

o.spec('plugin.decl for keywords', function() {
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

  o('leaves unknown values as is (hasKeywords set to false)', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('display', 'inline')
    methods.decl('color', 'red')

    o(sink.buffer).deepEquals([
      ['decl', 'display', 'inline'],
      ['decl', 'color', 'red']
    ])
  })
  o('leaves unknown values as is (hasKeywords set to true)', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.hasKeywords = true
    fixers.keywords = unPrefixedKeywords

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('display', 'inline')
    methods.decl('color', 'red')

    o(sink.buffer).deepEquals([
      ['decl', 'display', 'inline'],
      ['decl', 'color', 'red']
    ])
  })
  o('leaves prefixable values as is when they don\'t need a prefix', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.hasKeywords = true
    fixers.keywords = unPrefixedKeywords

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('display', 'grid')

    o(sink.buffer).deepEquals([
      ['decl', 'display', 'grid']
    ])
  })
  o('adds prefixes', function() {
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.hasKeywords = true
    fixers.keywords = prefixedKeywords
    fixers.initial = '-o-initial'

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.decl('display', 'box')
    methods.decl('display', 'inline-box')
    methods.decl('display', 'inline')
    methods.decl('cursor', 'grab')
    methods.decl('cursor', 'inherit')
    methods.decl('position', 'sticky')
    methods.decl('position', 'absolute')
    methods.decl('max-width', 'fit-content')
    methods.decl('max-width', '10em')
    methods.decl('color', 'initial')
    methods.decl('color', 'red')
    methods.decl('font', 'initial')
    methods.decl('font', 'inherit')

    o(sink.buffer).deepEquals([
      ['decl', 'display', '-o-box'],
      ['decl', 'display', '-o-inline-box'],
      ['decl', 'display', 'inline'],
      ['decl', 'cursor', '-o-grab'],
      ['decl', 'cursor', 'inherit'],
      ['decl', 'position', '-o-sticky'],
      ['decl', 'position', 'absolute'],
      ['decl', 'max-width', '-o-fit-content'],
      ['decl', 'max-width', '10em'],
      ['decl', 'color', '-o-initial'],
      ['decl', 'color', 'red'],
      ['decl', 'font', '-o-initial'],
      ['decl', 'font', 'inherit']
    ])
  })
})