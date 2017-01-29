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



o.spec('plugin @supports parameters', function() {
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
    mocks(global)
    initBrowser()

    var plugin = createPrefixPlugin()
    plugin.set.setPrefixDb(fixers)
    var sink = makeSink()
    var methods = plugin.filter(sink)

    methods.atrule('@supports', 'supports', '(foo:bar)', true)

    o(sink.buffer).deepEquals([['atrule', '@supports', 'supports', '(foo:bar)', true]])
  })
  o('adds prefixes adequately (simple example)', function() {
    mocks(global, {
      properties: {
        OFoo: 'bar'
      }
    })
    initBrowser()

    var sink = makeSink()
    var methods = createPrefixPlugin().filter(sink)

    methods.atrule('@supports', 'supports', '(foo: foo)', true)

    o(sink.buffer).deepEquals([
      ['atrule', '@supports', 'supports', '(-o-foo:foo)',  true]
    ])
  })
  o('adds prefixes adequately (complex example)', function() {
    mocks(global, {
      properties: {
        OFoo: 'bar',
        backgroundImage: ['-o-linear-gradient(red, teal)'],
        display:['-o-box', '-o-grid'],
        width: '-o-calc(1px + 5%)',
        color: '-o-initial'
      }
    })
    initBrowser()

    var sink = makeSink()
    var methods = createPrefixPlugin().filter(sink)

    methods.atrule('@supports', 'supports',
      '(foo: foo) and ' +
      '(transition: foo cubic-bezier(calc(2 * var(--foo)),foo,calc(1 + var(--ofo)))) and ' +
      '(transition-property: bar,foo) and ' +
      '(display: flex) and ' +
      '(display: grid) and ' +
      '(background-image: linear-gradient(40deg, rgb(0, 0, calc(3 * var(--oof))))) and ' +
      '(foo: initial)',
      true)

    o(sink.buffer).deepEquals([
      [
        'atrule', '@supports', 'supports',
        '(-o-foo:foo) and ' +
        '(transition:-o-foo cubic-bezier(-o-calc(2 * var(--foo)),foo,-o-calc(1 + var(--ofo)))) and ' +
        '(transition-property:bar,-o-foo) and ' +
        '(display:-o-box) and ' +
        '(display:-o-grid) and ' +
        '(background-image:-o-linear-gradient(50deg, rgb(0, 0, -o-calc(3 * var(--oof))))) and ' +
        '(-o-foo:-o-initial)',
        true
      ]
    ])
  })
})