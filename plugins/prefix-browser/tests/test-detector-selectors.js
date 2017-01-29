var o = require('../test-utils/ospec-instance')

var cleanupIfNeeded = require('../test-utils/misc').cleanupIfNeeded
var exposed = require('../test-utils/exposed')
var mocks = require('../test-utils/mocks')
var upToDate = require('../test-utils/misc').upToDate

var init = exposed.init
var hasCleanState = exposed.hasCleanState
var finalize = exposed.finalize
var detectSelectors = exposed.detectSelectors
var blankFixers = exposed.blankFixers

var referenceFixers = Object.keys(blankFixers())
'::input-placeholder','::placeholder', ':input-placeholder',':placeholder',

o.spec('detectSelectors', function() {
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
    o(upToDate(__dirname, '../src/detectors/selectors.js')).equals(true)
  })

  o('works when no prefix are supported', function(){
    mocks(global)
    init()
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList.length).equals(0)
    o(fixers.selectorMap).deepEquals({})
  })
  o('works with a prefix but no valid selector', function(){
    mocks(global)
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList.length).equals(0)
    o(fixers.selectorMap).deepEquals({})
  })
  o('works with a prefix and unprefixed selectors', function(){
    mocks(global, {rules: [
      ':any-link{}', ':read-only{}', ':read-write{}', '::selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList.length).equals(0)
    o(fixers.selectorMap).deepEquals({})
  })
  o('works with a prefix and prefixed selectors', function(){
    mocks(global, {rules: [
      ':-o-any-link{}',':-o-read-only{}', ':-o-read-write{}', '::-o-selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList.sort()).deepEquals(['::selection', ':any-link', ':read-only', ':read-write'])
    o(fixers.selectorMap).deepEquals({
      '::selection': '::-o-selection',
      ':any-link': ':-o-any-link',
      ':read-only': ':-o-read-only',
      ':read-write': ':-o-read-write'
    })
  })

  o('works with a prefix and both prefixed and unprefixed selectors', function(){
    mocks(global, {rules: [
      ':any-link{}', ':read-only{}', ':read-write{}', '::selection{}',
      ':-o-any-link{}',':-o-read-only{}', ':-o-read-write{}', '::-o-selection{}'
    ]})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList.length).equals(0)
  })
  o(':placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o('::placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o(':input-placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o('::input-placeholder', function() {
    mocks(global, {rules: [':placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o(':-o-placeholder', function() {
    mocks(global, {rules: [':-o-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals(['::placeholder'])
    o(fixers.selectorMap).deepEquals({'::placeholder': ':-o-placeholder'})
  })
  o('::-o-placeholder', function() {
    mocks(global, {rules: ['::-o-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals(['::placeholder'])
    o(fixers.selectorMap).deepEquals({'::placeholder': '::-o-placeholder'})
  })
  o(':-o-input-placeholder', function() {
    mocks(global, {rules: [':-o-input-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals(['::placeholder'])
    o(fixers.selectorMap).deepEquals({'::placeholder': ':-o-input-placeholder'})
  })
  o('::-o-input-placeholder', function() {
    mocks(global, {rules: ['::-o-input-placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals(['::placeholder'])
    o(fixers.selectorMap).deepEquals({'::placeholder': '::-o-input-placeholder'})
  })
  o('both ::placeholder and :-o-placeholder', function() {
    mocks(global, {rules: [':-o-placeholder{}', '::placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o('both ::placeholder and ::-o-placeholder', function() {
    mocks(global, {rules: ['::-o-placeholder{}', '::placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o('both ::placeholder and :-o-input-placeholder', function() {
    mocks(global, {rules: [':-o-input-placeholder{}', '::placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
  o('both ::placeholder and ::-o-input-placeholder', function() {
    mocks(global, {rules: ['::-o-input-placeholder{}', '::placeholder{}']})
    init()
    fixers.prefix = '-o-'
    detectSelectors(fixers)
    finalize()

    o(fixers.selectorList).deepEquals([])
    o(fixers.selectorMap).deepEquals({})
  })
})
