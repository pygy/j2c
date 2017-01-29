var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var sink = require('../../../test-utils/sinks').simple
var mocks = require('../test-utils/mocks')

var J2c = require('../../..')

var blankFixers = exposed.blankFixers
var initBrowser = exposed.initBrowser
var hasCleanState = exposed.hasCleanState
var prefixPlugin = exposed.createPrefixPlugin

var referenceFixers = Object.keys(blankFixers())

o.spec('plugin-prefix-browser integration', function() {
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

  o('works', function(){
    mocks(global)
    initBrowser()

    fixers.prefix = '-o-'
    fixers.properties = {animation: '-o-animation'}

    var j2c = J2c({plugins: [prefixPlugin(), sink]})

    j2c.setPrefixDb(fixers)

    var css = j2c.sheet({'@global': {
      '@keyframes foo': {
        'from, to': {width: 0}
      },
      '.bar' :{
        animation: 'baz 1sec'
      }
    }})
    o(css).deepEquals([
      ['atrule', '@keyframes', 'keyframes', 'foo', 'rule'],
        ['rule', 'from, to'],
          ['decl', 'width', '0'],
        ['_rule'],
      ['_atrule'],
      ['rule', '.bar'],
        ['decl', '-o-animation', 'baz 1sec'],
      ['_rule']
    ])
  })
})