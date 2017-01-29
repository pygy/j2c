var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var init = exposed.init
var hasCleanState = exposed.hasCleanState
var finalize = exposed.finalize
var detectPrefix = exposed.detectPrefix
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())


o.spec('detectPrefix', function() {
  var fixers
  o.beforeEach(function() {
    o(hasCleanState()).equals(true)('detector utils state isn\'t clean')
    fixers = blankFixers()
  })
  o.afterEach(function() {
    cleanupIfNeeded(exposed)
    // no key was added at run time (that would cause deopts)
    o(Object.keys(fixers)).deepEquals(referenceFixers)
    fixers = null
  })

  o('build up to date', function() {
    o(upToDate(__dirname, '../src/detectors/prefix.js')).equals(true)
  })

  o('no properties', function() {
    mocks(global)
    init()
    detectPrefix(fixers)
    finalize()

    o(fixers.prefix).equals('')
  })
  ;[true, false].forEach(function(computedStyleAsArray) {
    o('properties without a prefix ('+ (computedStyleAsArray ? 'computed style as array' : 'computed style as object') +')', function() {
      mocks(global, {
        computedStyleAsArray: computedStyleAsArray,
        properties: {
          color: 'red',
          width: '0'
        }
      })
      init()
      detectPrefix(fixers)
      finalize()

      o(fixers.prefix).equals('')
    })
    o('properties with a single prefix ('+ (computedStyleAsArray ? 'computed style as array' : 'computed style as object') +')', function() {
      mocks(global, {
        computedStyleAsArray: computedStyleAsArray,
        properties: {
          MozColor: 'red',
          width: '0'
        }
      })
      init()
      detectPrefix(fixers)
      finalize()

      o(fixers.prefix).equals('-moz-')
    })
    o('properties with two prefixes, majority prefix first ('+ (computedStyleAsArray ? 'computed style as array' : 'computed style as object') +')', function() {
      mocks(global, {
        computedStyleAsArray: computedStyleAsArray,
        properties: {
          MozColor: 'red',
          MozMargin: '0',
          OMargin: '0',
          width: '0'
        }
      })
      init()
      detectPrefix(fixers)
      finalize()

      o(fixers.prefix).equals('-moz-')
    })
    o('properties with two prefixes, majority prefix last ('+ (computedStyleAsArray ? 'computed style as array' : 'computed style as object') +')', function() {
      mocks(global, {
        computedStyleAsArray: computedStyleAsArray,
        properties: {
          OMargin: '0',
          MozColor: 'red',
          MozMargin: '0',
          width: '0'
        }
      })
      init()
      detectPrefix(fixers)
      finalize()

      o(fixers.prefix).equals('-moz-')
    })
  })
})
