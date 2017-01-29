var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var hasCleanState = exposed.hasCleanState
var init = exposed.init
var finalize = exposed.finalize
var detectFunctions = exposed.detectFunctions
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())


o.spec('detectFunctions', function() {
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
    o(upToDate(__dirname, '../src/detectors/functions.js')).equals(true)
  })

  o('works when no prefix are supported', function(){
    mocks(global, {properties: {backgroundImage:'red', width: '0px'}})
    init()
    detectFunctions(fixers)
    finalize()

    o(fixers.functions.length).equals(0)
  })
  o('works with a prefix but no valid functions', function(){
    mocks(global, {properties: {backgroundImage:'red', width: '0px'}})
    init()
    fixers.prefix = '-o-'
    detectFunctions(fixers)
    finalize()

    o(fixers.functions.length).equals(0)
  })
  o('works with a prefix and unprefixed functions', function(){
    mocks(global, {properties: {
      backgroundImage: ['linear-gradient(red, teal)', 'radial-gradient(red, teal)', 'element(#foo)', 'cross-fade(url(a.png), url(b.png), 50%)'],
      width: 'calc(1px + 5%)'
    }})
    init()
    fixers.prefix = '-o-'
    detectFunctions(fixers)
    finalize()

    o(fixers.functions.length).equals(0)
  })
  o('works with a prefix and prefixed functions', function(){
    mocks(global, {properties: {
      backgroundImage: ['-o-linear-gradient(red, teal)', '-o-radial-gradient(red, teal)', '-o-element(#foo)', '-o-cross-fade(url(a.png), url(b.png), 50%)'],
      width: '-o-calc(1px + 5%)',
      zIndex: '0'
    }})
    init()
    fixers.prefix = '-o-'
    detectFunctions(fixers)
    finalize()

    o(fixers.functions.sort()).deepEquals(['calc', 'cross-fade', 'element', 'linear-gradient', 'radial-gradient'])
  })

  o('works with a prefix and both prefixed and unprefixed functions', function(){
    mocks(global, {properties: {
      backgroundImage: [
        'linear-gradient(red, teal)', 'radial-gradient(red, teal)', 'element(#foo)', 'cross-fade(url(a.png), url(b.png), 50%)',
        '-o-linear-gradient(red, teal)', '-o-radial-gradient(red, teal)', '-o-element(#foo)', '-o-cross-fade(url(a.png), url(b.png), 50%)'
      ],
      width: ['calc(1px + 5%)', '-o-calc(1px + 5%)']
    }})
    init()
    fixers.prefix = '-o-'
    detectFunctions(fixers)
    finalize()

    o(fixers.functions.length).equals(0)
  })
})
