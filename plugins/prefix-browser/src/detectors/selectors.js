// Derived from Lea Verou's PrefixFree

import {supportedRule} from './core.js'

export function detectSelectors(fixers) {
  var selector, prefixed
  function prefixSelector(selector) {
    return selector.replace(/^::?/, function($0) { return $0 + fixers.prefix })
  }

  if (fixers.prefix === '') return
  var selectors = {
    ':any-link': null,
    '::backdrop': null,
    ':fullscreen': null, //TODO sort out what changed between specs
    ':full-screen': ':fullscreen',
    //sigh
    '::placeholder': null,
    ':placeholder': '::placeholder',
    '::input-placeholder': '::placeholder',
    ':input-placeholder': '::placeholder',
    ':read-only': null,
    ':read-write': null,
    '::selection': null
  }

  // builds an array of selectors that need a prefix.
  for (selector in selectors) {
    prefixed = prefixSelector(selector)
    if(!supportedRule(selectors[selector] || selector) && supportedRule(prefixed)) {
      fixers.hasSelectors = true
      fixers.selectorList.push(selectors[selector] || selector)
      fixers.selectorMap[selectors[selector] || selector] = prefixed
    }
  }
}