var camelCase = require('./exposed').camelCase
var deCamelCase = require('./exposed').deCamelCase

// These mocks provide the bare minimal functionality to enable testing
// They are incorrect by design. By no way are they intended to
// provide an accurate implementation of the corresponding DOM APIs.

function firstMatch(prefix, ary) {
  for (var i = 0; i < ary.length; i++) {
    if (ary[i].indexOf(prefix) === 0) return i
  }
}
function lastMatch(prefix, ary) {
  for (var i = ary.length; i--;) {
    if (ary[i].indexOf(prefix) === 0) return i
  }
}

// options:
// computedStyleAsArray (boolean) determines whether getComputedStyle()
//                                returns a plain array or an object.
// properties (object): a map of property names to either a string or
//                      string arrays (representing the values that can
//                      be set) or null if the property should appear as
//                      not supported
// rules (array<string>): the strings represent the rules supported

module.exports = function (global, options) {
  if (options == null) options = {}

  global.cleanupMocks = function(){
    delete global.cleanupMocks
    delete global.getComputedStyle
    delete global.document
  }

  global.getComputedStyle = function() {
    // sorting may not be necessary...
    var allProps = Object.keys(options.properties || {})
    var nonShortcuts = allProps.filter(function(v) {
      return firstMatch(v, allProps) === lastMatch(v, allProps)
    })
    var res
    if (options.computedStyleAsArray) {
      res = nonShortcuts.filter(function(p){
        return options.properties[p] != null
      }).map(deCamelCase)
      res.forEach(function(_p){
        var P = camelCase(_p)
        res[P] = typeof options.properties[P] === 'string' ? options.properties[P] : options.properties[P][0]
      })
      return res
    } else {
      res = {}
      nonShortcuts.filter(function(p){
        return options.properties[p] != null
      }).forEach(function(p){
        res[p] = typeof options.properties[p] === 'string' ? options.properties[p] : options.properties[p][0]
      })
      return res
    }
  }
  global.document = {
    createElement: function(tag) {
      if (tag === 'div') {
        var proxy = {}, style = {}, possibleValues = {}
        Object.keys(options.properties || {}).forEach(function(prop) {
          var value = options.properties[prop]
          if (value != null) {
            if (typeof value === 'string') value = [value]
            value.push('')
          }
          possibleValues[prop] = value
          style[prop] = value ? '' : null
          Object.defineProperty(proxy, prop, {
            configurable: true,
            enumerable: true,
            get: function() {return style[prop]},
            set: function(value) {
              if (
                possibleValues[prop] != null && possibleValues[prop].indexOf(value) > -1
              ) {
                style[prop] = '' + value
              } else {
                style[prop] = null
              }
            }
          })
          if (prop != 'zIndex') Object.defineProperty(proxy, deCamelCase(prop), {
            configurable: true,
            enumerable: true,
            get: function() {return style[prop] == null ? null: style[prop]},
            set: function(value) {
              if (
                possibleValues[prop] != null && possibleValues[prop].indexOf(value) > -1
              ) {
                style[prop] = '' + value
              } else {
                style[prop] = null
              }
            }
          })
        })
        return {
          style: proxy
        }
      } else if (tag === 'style') {
        return {
          set textContent(txt) {
            if (/^@media/.test(txt)) {
              if (options.rules != null && options.rules.indexOf(txt) > -1) {
                this.sheet.cssRules[0] = {cssText: txt}
              } else {
                this.sheet.cssRules[0] = {cssText: '@media not all {\n}'}
              }
            } else {
              if (options.rules != null && options.rules.indexOf(txt) > -1) {
                this.sheet.cssRules.length = 1
              } else {
                this.sheet.cssRules.length = 0
              }
            }
          },
          sheet: {
            cssRules: []
          }
        }
      } else {
        throw new Error('[DOM mocks] unsupported tag: '+ tag)
      }
    },
    documentElement : {
      appendChild: function(a) {return a},
      removeChild: function() {}
    }
  }
}
