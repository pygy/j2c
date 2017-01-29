var fs = require('fs')
var path = require('path')

var mocks = require('./mocks')

module.exports.upToDate = function(baseDir, name) {
  var sourceTime = fs.statSync(path.join(baseDir, name)).mtime.getTime()
  var exposedTime = fs.statSync(path.join(__dirname, 'exposed.js')).mtime.getTime()
  return sourceTime < exposedTime
}

module.exports.makeSink = function() {
  var buffer = []
  return {
    atrule : function(rule, kind, params, hasblock) {
      buffer.push(['atrule', rule, kind, params, hasblock])
    },
    // _atrule : function() {
    //   buffer.push(['_atrule'])
    // },
    decl: function(prop, value) {
      buffer.push(['decl', prop, value])
    },
    rule : function(selector) {
      buffer.push(['rule', selector])
    },
    // _rule : function() {
    //   buffer.push(['_rule'])
    // },
    // err: function(message) {
    //   buffer.push(['err', message])
    // },
    buffer: buffer
  }
}

module.exports.cleanupIfNeeded = function(exposed){
  if (typeof global.cleanupMocks === 'function') {
    mocks(global)
    global.cleanupMocks()
    exposed && exposed.cleanupDetectorUtils()
  }
}