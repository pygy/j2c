var o = require('../test-utils/ospec-instance')

var J2c = require('../dist/j2c.commonjs')
var sink = require('../test-utils/sinks').simple

o.spec('namespaces', function (){
  o('basic', function(){
    var j2c = J2c({plugins: [sink]})
    var other = j2c.ns('other')
    var j2cRes = j2c.inline({animationName: 'foo'})
    var otherRes = other.inline({animationName: 'foo'})

    o(other.prefix).equals('__other_')
    o(other.suffix).equals(j2c.suffix)

    o(j2c.names.foo).equals('foo'+j2c.suffix)
    o(other.names.foo).equals('__other_foo'+j2c.suffix)

    o(j2cRes).deepEquals([['decl', 'animation-name', j2c.names.foo]])
    o(otherRes).deepEquals([['decl', 'animation-name', other.names.foo]])
  })
  o('namespaced instances inherit plugin.set properties', function() {
    var plugin = {set: {foo: 'bar'}}

    var j2c = J2c({plugins: [plugin, sink]})
    var other = j2c.ns('other')

    o(j2c.hasOwnProperty('foo')).equals(true)
    o(other.hasOwnProperty('foo')).equals(true)

    o(j2c.foo).equals('bar')
    o(other.foo).equals('bar')
  })
  o('namespaces are cached', function() {
    var j2c = J2c({plugins: [sink]})
    var other = j2c.ns('other')
    var other2 = j2c.ns('other')

    o(other).equals(other2)
    o(other.names).equals(other2.names)

  })
})