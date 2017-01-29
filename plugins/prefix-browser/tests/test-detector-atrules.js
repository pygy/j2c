var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var hasCleanState = exposed.hasCleanState
var init = exposed.init
var finalize = exposed.finalize
var detectAtrules = exposed.detectAtrules
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())


o.spec('detectAtrules', function() {
  var fixers
  o.beforeEach(function() {
    o(hasCleanState()).equals(true)('detector utils state isn\'t clean')
    fixers = blankFixers()
  })
  o.afterEach(function() {
    cleanupIfNeeded(exposed)
    o(Object.keys(fixers)).deepEquals(referenceFixers)
  })

  o('build up to date', function() {
    o(upToDate(__dirname, '../src/detectors/atrules.js')).equals(true)
  })

  o('works without options', function(){
    mocks(global)
    init()
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(null)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
  })
  o('works with a prefix manually imposed and no options', function(){
    mocks(global)
    init()
    fixers.prefix = '-o-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
    o('min-resolution' in fixers.properties).equals(false)
  })
  o('works with a prefix manually imposed and prefixed @keyframes, @viewport and @document', function(){
    mocks(global, {
      rules: ['@-o-keyframes name{}', '@-o-viewport {}', '@-o-document regexp("."){}']
    })
    init()
    fixers.prefix = '-o-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({'@keyframes':'@-o-keyframes', '@viewport': '@-o-viewport', '@document': '@-o-document'})
    o('min-resolution' in fixers.properties).equals(false)
  })
  o('favours unprefixed rules', function(){
    mocks(global, {
      rules: ['@-o-keyframes name{}', '@-o-viewport {}', '@-o-document regexp("."){}', '@keyframes name{}', '@viewport {}', '@document regexp("."){}']
    })
    init()
    fixers.prefix = '-o-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
    o('min-resolution' in fixers.properties).equals(false)
  })
  o('detects dppx', function(){
    mocks(global, {
      rules: ['@media (resolution:1dppx){}']
    })
    init()
    fixers.prefix = '-o-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(true)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
    o('min-resolution' in fixers.properties).equals(false)
  })
  o('detects -webkit-device-pixel-ratio', function(){
    mocks(global, {
      rules: ['@media (-webkit-device-pixel-ratio:1){}']
    })
    init()
    fixers.prefix = '-webkit-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(true)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
    o(fixers.properties['resolution']).equals('-webkit-device-pixel-ratio')
    o(fixers.properties['min-resolution']).equals('-webkit-min-device-pixel-ratio')
    o(fixers.properties['max-resolution']).equals('-webkit-max-device-pixel-ratio')
  })
  o('detects -moz-device-pixel-ratio', function(){
    mocks(global, {
      rules: ['@media (-moz-device-pixel-ratio:1){}', '@media (min--moz-device-pixel-ratio:1){}']
    })
    init()
    fixers.prefix = '-moz-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(true)
    o(fixers.hasPixelRatioFraction).equals(false)
    o(fixers.atrules).deepEquals({})
    o(fixers.properties['resolution']).equals('-moz-device-pixel-ratio')
    o(fixers.properties['min-resolution']).equals('min--moz-device-pixel-ratio')
    o(fixers.properties['max-resolution']).equals('max--moz-device-pixel-ratio')
  })
  o('detects -o-device-pixel-ratio', function(){
    mocks(global, {
      rules: ['@media (-o-device-pixel-ratio:1/1){}']
    })
    init()
    fixers.prefix = '-o-'
    detectAtrules(fixers)
    finalize()

    o(fixers.hasDppx).equals(false)
    o(fixers.hasPixelRatio).equals(false)
    o(fixers.hasPixelRatioFraction).equals(true)
    o(fixers.atrules).deepEquals({})
    o(fixers.properties['resolution']).equals('-o-device-pixel-ratio')
    o(fixers.properties['min-resolution']).equals('-o-min-device-pixel-ratio')
    o(fixers.properties['max-resolution']).equals('-o-max-device-pixel-ratio')
  })
})
