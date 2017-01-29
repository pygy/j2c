var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var blankFixers = exposed.blankFixers
var hasCleanState = exposed.hasCleanState
var camelCase= exposed.camelCase
var deCamelCase= exposed.deCamelCase
var detectKeywords = exposed.detectKeywords
var finalize = exposed.finalize
var init = exposed.init

var referenceFixers = Object.keys(blankFixers())

// -----------------------------------
// define options and expected results

var noFlexSrc = {
  'color': ['initial'],
  'cursor': [ 'grab', 'grabbing', 'zoom-in', 'zoom-out'],
  'display' : ['grid', 'inline-grid'],
  'position': ['sticky'],
  'width, columnWidth, height, maxHeight, maxWidth, minHeight, minWidth': ['contain-floats', 'fill-available', 'fit-content', 'max-content', 'min-content']
}

var unprefixed = {}, prefixed = {}, both = {}, result = {}
var  properties = {noFlex: {}, flex: {}, box: {}, flexbox: {}}
var emptyResult = [
  'cursor', 'display', 'position', 'width', 'columnWidth', 'height',
  'maxHeight', 'maxWidth', 'minHeight', 'minWidth'
].reduce(function(acc, k){
  acc[deCamelCase(k)] = {}
  return acc
}, {})

unprefixed.noFlex = Object.keys(noFlexSrc).reduce(function(acc, kk){
  kk.split(', ').forEach(function(k) {
    acc[k] = noFlexSrc[kk]
  })
  return acc
}, {})
unprefixed.flex = {display:['flex', 'inline-flex']}
unprefixed.box = {display:['box', 'inline-box']}
unprefixed.flexbox = {display:['flexbox', 'inline-flexbox']}

;['noFlex', 'flex', 'box', 'flexbox'].forEach(function(flexType) {
  prefixed[flexType] = Object.keys(unprefixed[flexType]).reduce(function(acc, k) {
    acc[k] = unprefixed[flexType][k].map(function(v) {return '-o-' + v})
    return acc
  }, {})

  both[flexType] = Object.keys(unprefixed[flexType]).reduce(function(acc, k) {
    acc[k] = unprefixed[flexType][k].concat(prefixed[flexType][k])
    return acc
  }, {})

  result[flexType] = Object.keys(emptyResult).reduce(function(acc, k) {
    if (k !== 'color' && camelCase(k) in unprefixed[flexType]) acc[k] = unprefixed[flexType][camelCase(k)].reduce(function(acc2, v){
      acc2[v] = '-o-' + v
      return acc2
    }, {})
    else acc[k] = {}
    return acc
  }, {})
})


Object.assign(properties.flexbox, exposed.flex2012Props)
Object.keys(exposed.flex2012Props).forEach(function(p) {
  result.flexbox[p] = exposed.flex2012Values
})
result.flexbox.display.flex = result.flexbox.display.flexbox
result.flexbox.display['inline-flex'] = result.flexbox.display['inline-flexbox']


Object.assign(
  properties.box,
  Object.keys(exposed.flex2009Props).reduce(function(acc, k){
    acc[k] = '-o-' + exposed.flex2009Props[k]
    return acc
  }, {})
)
Object.keys(exposed.flex2009Props).forEach(function(p) {
  result.box[p] = exposed.flex2009Values
})
result.box.display.flex = result.box.display.box
result.box.display['inline-flex'] = result.box.display['inline-box']


// -----------------------------------

o.spec('detectKeywords', function() {
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

    o(upToDate(__dirname, '../src/detectors/keywords.js')).equals(true)
  })

  o('works when no prefix are supported', function(){
    mocks(global)
    init()
    detectKeywords(fixers)
    finalize()

    o(fixers.keywords).deepEquals({})
    o(fixers.initial).equals(null)
  })
  o('works with a prefix but no valid keyword', function(){
    mocks(global)
    init()
    fixers.prefix = '-o-'
    detectKeywords(fixers)
    finalize()

    o(fixers.keywords).deepEquals(emptyResult)
    o(fixers.initial).equals(null)
  })

  ;['noFlex', 'flex', 'box', 'flexbox'].forEach(function(flexType) {
    o('works with a prefix and unprefixed keywords (' + flexType + ')', function(){
      mocks(global, {properties: unprefixed[flexType]})
      init()
      fixers.prefix = '-o-'
      detectKeywords(fixers)
      finalize()

      o(fixers.keywords).deepEquals(emptyResult)
      o(fixers.initial).equals(null)
    })
    o('works with a prefix and prefixed keywords (' + flexType + ')', function(){
      mocks(global, {properties: prefixed[flexType]})
      init()
      fixers.prefix = '-o-'
      detectKeywords(fixers)
      finalize()
      o(fixers.keywords).deepEquals(result[flexType])
      o(fixers.initial).equals(flexType === 'noFlex' ? '-o-initial' : null)
    })

    o('works with a prefix and both prefixed and unprefixed keywords (' + flexType + ')', function(){
      mocks(global, {properties: both[flexType]})
      init()
      fixers.prefix = '-o-'
      detectKeywords(fixers)
      finalize()

      o(fixers.keywords).deepEquals(emptyResult)
      o(fixers.initial).equals(null)
    })
  })
})
