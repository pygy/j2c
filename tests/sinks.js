var o = require('../test-utils/ospec-instance')

var J2c = require('../dist/j2c.commonjs')

var own = ({}).hasOwnProperty

var ref = {
  inline: ['init', 'done', 'err', 'raw', 'decl'],
  sheet: ['init', 'done', 'err', 'raw', 'decl', 'rule', '_rule', 'atrule', '_atrule']
}


o.spec('sinks', function() {
  o.spec('default sinks', function(){
    var j2c, sheetSink, inlineSink
    o.beforeEach(function(){
      // get the Sinks out
      j2c = new J2c({plugins: [{filter: function(next) {
        if ('rule' in next) sheetSink = next
        else inlineSink = next
        return {}
      }}]})
      j2c.sheet({})
      j2c.inline({})
    })
    o('the sheet sink exposes appropriate methods', function() {
      var methods = []
      for (var k in sheetSink) if (own.call(sheetSink, k)) methods.push(k)
      o(methods.sort()).deepEquals(ref.sheet.sort())
    })
    o('the inline sink exposes appropriate methods', function() {
      var methods = []
      for (var k in inlineSink) if (own.call(sheetSink, k)) methods.push(k)
      o(methods.sort()).deepEquals(ref.inline.sort())
    })
    // Do we want more individual tests for the default sink?
  })
  o.spec('sink plugins', function() {
    o('sheet sinks work', function() {
      var methods = [
        'init', 'done', 'err', 'raw', 'decl', 'rule', '_rule', 'atrule', '_atrule'
      ]
      var sink = methods.reduce(function(acc, method){
        acc[method] = o.spy()
        return acc
      }, {})
      var j2c = J2c({plugins: [{sink:function(){return [sink]}}]})
      j2c.sheet([
        {'@media foo': {
          'p': {
            color:'red'
          },
          '@adopt foo': ['bar']
        }},
        'raw'
      ])
      o(sink.init.callCount).equals(1)
      o(sink.done.callCount).equals(1)
      o(sink.err.callCount).equals(1)
      o(sink.raw.callCount).equals(1)
      o(sink.decl.callCount).equals(1)
      o(sink.rule.callCount).equals(1)
      o(sink._rule.callCount).equals(1)
      o(sink.atrule.callCount).equals(1)
      o(sink._atrule.callCount).equals(1)
    })
  })
})