
// This simple backend pushes the arguments in arrays in a buffer and return it as is.
// So, for example,
//     j2c.sheet({'@global': {
//       '@keyframes foo': {
//         'from, to': {width: 0}
//       },
//       '.bar' :{
//         animation: 'baz 1sec',
//       }
//     }})
//
// becomes
//
//     [
//       ['atrule', '@keyframes', 'keyframes', 'foo', 'rule'],
//         ['rule', 'from, to'],
//           ['decl', 'width', 0],
//         ['_rule'],
//       ['_atrule'],
//       ['rule', '.bar'],
//         ['decl', 'animation', 'baz 1sec'],
//       ['_rule']
//     ]

module.exports.simple = {sink: function() {
  var buffer
  return [{
    init: function() {
      buffer = []
    },
    done: function() {
      return buffer
    },
    atrule : function(rule, kind, params, hasblock) {
      buffer.push(['atrule', rule, kind, params, hasblock])
    },
    _atrule : function() {
      buffer.push(['_atrule'])
    },
    decl: function(prop, value) {
      buffer.push(['decl', prop, value])
    },
    rule : function(selector) {
      buffer.push(['rule', selector])
    },
    _rule : function() {
      buffer.push(['_rule'])
    },
    err: function(message) {
      buffer.push(['err', message])
    },
    raw: function(str) {
      buffer.push(['raw', str])
    },
    buffer: buffer
  }]
}}