// Derived from Lea Verou's PrefixFree

var allStyles, styleAttr, styleElement, supportedProperty, supportedDecl

function init() {
  allStyles = getComputedStyle(document.documentElement, null)
  styleAttr = document.createElement('div').style
  styleElement = document.documentElement.appendChild(document.createElement('style'))
  supportedDecl = _supportedDecl
  supportedProperty = _supportedProperty
  if ('zIndex' in styleAttr && !('z-index' in styleAttr)) {
    // Some browsers like it dash-cased, some camelCased, most like both.
    supportedDecl = function(property, value) {return _supportedDecl(camelCase(property), value)}
    supportedProperty = function(property) {return _supportedProperty(camelCase(property))}
  }
}
function finalize() {
  if (typeof document !== 'undefined') document.documentElement.removeChild(styleElement)
  // `styleAttr` is used at run time via `supportedProperty()`
  // `allStyles` and `styleElement` can be displosed of after initialization.
  allStyles = styleElement = null
}
function cleanupDetectorUtils() {
  finalize()
  styleAttr = null
}
function hasCleanState() {
  return allStyles == null && styleAttr == null && styleElement == null
}
// Helpers, in alphabetic order

function camelCase(str) {
  return str.replace(/-([a-z])/g, function($0, $1) { return $1.toUpperCase() }).replace('-','')
}
function deCamelCase(str) {
  return str.replace(/[A-Z]/g, function($0) { return '-' + $0.toLowerCase() })
}
function _supportedDecl(property, value) {
  styleAttr[property] = ''
  styleAttr[property] = value
  return !!styleAttr[property]
}
function supportedMedia(property, value) {
  styleElement.textContent = '@media (' + property + ':' + value +'){}'
  // The !!~indexOf trick. False for -1, true otherwise.
  return !!~styleElement.sheet.cssRules[0].cssText.indexOf(value)
}
function _supportedProperty(property) {
  return property in styleAttr
}
function supportedRule(selector) {
  styleElement.textContent = selector + '{}'
  return !!styleElement.sheet.cssRules.length
}

export {
  allStyles, styleAttr,
  init, finalize, cleanupDetectorUtils, hasCleanState,
  camelCase, deCamelCase,
  supportedDecl, supportedMedia, supportedProperty, supportedRule
}