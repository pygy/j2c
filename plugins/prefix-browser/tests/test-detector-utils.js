var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var camelCase = exposed.camelCase
var cleanupDetectorUtils = exposed.cleanupDetectorUtils
var deCamelCase = exposed.deCamelCase
var hasCleanState = exposed.hasCleanState
var init = exposed.init

o.spec('core', function() {
  o('build up to date', function() {
    o(upToDate(__dirname, '../src/detectors/core.js')).equals(true)
  })
  o.spec('camel case conversion', function() {
    o('camelCase', function() {
      o(camelCase('foo')).equals('foo')
      o(camelCase('f-oo')).equals('fOo')
      o(camelCase('-foo')).equals('Foo')
      o(camelCase('foo')).equals('foo')
      o(camelCase('f--oo')).equals('fOo')
    })
    o('deCamelCase', function() {
      o(deCamelCase('foo')).equals('foo')
      o(deCamelCase('fOo')).equals('f-oo')
      o(deCamelCase('Foo')).equals('-foo')
    })
  })
  o('state cleanup', function() {
    mocks(global)
    init()
    cleanupDetectorUtils()
    o(hasCleanState()).equals(true)('detector utils state isn\'t clean')
    cleanupIfNeeded(exposed)
  })
})

