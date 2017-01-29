var ospec = require('ospec')
var o = ospec['new']('plugin-prefix-browser test-utils')
ospec('plugin-prefix-browser test-utils', o.run)

var mocks = require('../mocks')

o.spec('mocks', function() {
  o('basics', function() {
    o(mocks).notEquals(void 8)
    o(typeof mocks === 'function').equals(true)

    var window  = {}
    mocks(window)

    o(typeof window.getComputedStyle).equals('function')

    o(window.document).notEquals(null)
    o(typeof window.document).equals('object')
    o(typeof window.document.createElement).equals('function')

    o(window.document.documentElement).notEquals(null)
    o(typeof window.document.documentElement).equals('object')
    o(typeof window.document.documentElement.appendChild).equals('function')
    o(typeof window.document.documentElement.removeChild).equals('function')

    window.cleanupMocks()
    o(window).deepEquals({})
  })
  o('works with the real global object', function() {
    var globalKeys = Object.keys(global)

    o('document' in global).equals(false)
    o('getComputedStyle' in global).equals(false)

    mocks(global)

    o('document' in global).equals(true)
    o('getComputedStyle' in global).equals(true)

    global.cleanupMocks()

    o(globalKeys).deepEquals(Object.keys(global))
  })
  o('getComputedStyle works without options', function() {
    var window = {}
    mocks(window)

    o(window.getComputedStyle()).deepEquals({})
  })
  o('getComputedStyle works without properties', function() {
    var window = {}
    mocks(window, {})

    o(window.getComputedStyle()).deepEquals({})
  })
  o('getComputedStyle works without properties when expected to return an Array-like thing', function() {
    var window = {}
    mocks(window, {computedStyleAsArray: true})

    o(window.getComputedStyle()).deepEquals([])
  })
  o('getComputedStyle returning an object', function() {
    var window = {}
    var options = {
      properties: {
        color: 'red',
        paddingTop: ['0', '1px'],
        zIndex: '0'
      }
    }
    mocks(window, options)
    o(window.getComputedStyle()).deepEquals({color: 'red', paddingTop: '0', zIndex: '0'})
  })
  o('getComputedStyle returning an object with a shortcut property', function() {
    var window = {}
    var options = {
      properties: {
        color: 'red',
        paddingTop: ['0', '1px'],
        padding: '0'
      }
    }
    mocks(window, options)
    o(window.getComputedStyle()).deepEquals({color: 'red', paddingTop: '0'})
  })
  o('getComputedStyle returning an array', function() {
    var ref = ['color', 'padding-top']
    ref.color = 'red'
    ref.paddingTop = '0'

    var window = {}
    var options = {
      computedStyleAsArray: true,
      properties: {
        color: 'red',
        paddingTop: ['0', '1px']
      }
    }
    mocks(window, options)

    o(window.getComputedStyle()).deepEquals(ref)
  })
  o('getComputedStyle returning an array with a shortcut property', function() {
    var ref = ['color', 'padding-top']
    ref.color = 'red'
    ref.paddingTop = '0'

    var window = {}
    var options = {
      computedStyleAsArray: true,
      properties: {
        color: 'red',
        paddingTop: ['0', '1px'],
        padding: '0'
      }
    }
    mocks(window, options)

    o(window.getComputedStyle()).deepEquals(ref)
  })
  o('document.documentElement.appendChild returns its parameter', function() {
    var window = {}
    mocks(window)
    o(window.document.documentElement.appendChild('foo')).equals('foo')
  })

  o('createElement() throws on unknown elements', function() {
    var window = {}
    mocks(window)
    var threw = false
    try {
      window.document.createElement('dum dee dum')
    } catch (e) {
      threw = true
    }
    o(threw).equals(true)
  })

  o.spec('the style attribute', function(){
    o('basics', function() {
      var window = {}
      mocks(window)
      var elt = window.document.createElement('div')

      o(elt).deepEquals({style: {}})
    })
    o('getting a simple property with a single value', function() {
      var window = {}
      var options = {
        properties: {
          color: 'red'
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')
      o(elt).deepEquals({style: {color: ''}})
    })
    o('getting a simple property with an array of values', function() {
      var window = {}
      var options = {
        properties: {
          color: ['red', 'green']
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')

      o(elt).deepEquals({style: {color: ''}})
    })
    o('getting a simple property with a null value', function() {
      var window = {}
      var options = {
        properties: {
          color: null
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')

      o(elt).deepEquals({style: {color: null}})
    })
    o('setting a value that is supported', function() {
      var window = {}
      var options = {
        properties: {
          color: 'red'
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')
      elt.style.color = 'red'

      o(elt).deepEquals({style: {color: 'red'}})
    })
    o('setting values that are supported (for a property that supports several values)', function() {
      var window = {}
      var options = {
        properties: {
          color: ['red', 'blue']
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')
      elt.style.color = 'red'

      o(elt).deepEquals({style: {color: 'red'}})

      elt.style.color = 'blue'

      o(elt).deepEquals({style: {color: 'blue'}})
    })
    o('setting a value that is not supported (for a property that supports several values)', function() {
      var window = {}
      var options = {
        properties: {
          color: ['red', 'blue']
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')
      elt.style.color = 'red'

      o(elt).deepEquals({style: {color: 'red'}})

      elt.style.color = 'green'

      o(elt).deepEquals({style: {color: null}})
    })
    o('setting a value to a non-supported property', function() {
      var window = {}
      var options = {
        properties: {
          color: null
        }
      }
      mocks(window, options)
      var elt = window.document.createElement('div')

      elt.style.color = 'red'

      o(elt).deepEquals({style: {color: null}})
    })
  })
  o.spec('the style Element', function(){
    o('basics', function() {
      var window = {}
      mocks(window)
      var elt = window.document.createElement('style')

      o(elt).deepEquals({textContent: void 0, sheet: {cssRules: []}})
    })
    o('setting textContent with a supported rule', function() {
      var window = {}
      var options = {
        rules: ['foo']
      }
      mocks(window, options)
      var elt = window.document.createElement('style')
      elt.textContent = 'foo'

      o(elt.sheet.cssRules.length).equals(1)
    })
    o('setting textContent with an  unsupported rule', function() {
      var window = {}
      var options = {
        rules: ['foo']
      }
      mocks(window, options)
      var elt = window.document.createElement('style')
      elt.textContent = 'foo'
      elt.textContent = 'bar'

      o(elt.sheet.cssRules.length).equals(0)
    })
    o('@media setting textContent with a supported parameter', function() {
      var window = {}
      var options = {
        rules: ['@media (foo){}']
      }
      mocks(window, options)
      var elt = window.document.createElement('style')
      elt.textContent = '@media (foo){}'

      o(elt.sheet.cssRules.length).equals(1)
      o(elt.sheet.cssRules[0]).deepEquals({cssText: '@media (foo){}'})
    })
    o('@media setting textContent with an unsupported parameter', function() {
      var window = {}
      var options = {
        rules: ['@media (foo){}']
      }
      mocks(window, options)
      var elt = window.document.createElement('style')
      elt.textContent = '@media (bar){}'

      o(elt.sheet.cssRules.length).equals(1)
      o(elt.sheet.cssRules[0]).deepEquals({cssText: '@media not all {\n}'})
    })
  })
})
