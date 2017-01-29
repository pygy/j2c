var postcss = require('postcss')
var o = require('../test-utils/ospec-instance')
var j2c = require('../../..')
var j2cPostcss = require('../')

var $sink = require('../../../test-utils/sinks').simple

var autoprefixer = require('autoprefixer')

var plugin = j2cPostcss(postcss.plugin('plugin', function () {
  return function (css) {
    css.walk(function(node){
      if (node.type === 'atrule' && node.params) node.params += 'WAT'
      if (node.type === 'rule') node.selector += ', .postcss'
      if (node.type === 'decl') node.value += 'ish'
    })
  }
}))


o.spec('main', function() {
  o('modify inline styles', function(){
    o(j2c({plugins: [plugin, $sink]})
        .inline({color:'red'})
      ).deepEquals([['decl', 'color', 'redish']])
  })

  o('modify a full sheet', function(){
    o(j2c({plugins: [plugin]})
          .sheet({
            '@namespace': 'foo',
            '@media bar':{p:{color:'red'}}
          })
      ).equals('\
@namespace fooWAT;\n\
@media barWAT {\n\
p, .postcss {\n\
color:redish;\n\
}\n\
}\n'
      )
  })

  o('leave raw text as is', function(){
    o(j2c({plugins: [plugin, $sink]})
      .sheet([
        'a{color:green}',
        {
          '@namespace': 'foo',
          '@media bar':{p:'color:red'}
        }
      ])).deepEquals([
        ['raw', 'a{color:green}'],
        ['atrule', '@namespace', 'namespace', 'fooWAT', void 0],
        ['atrule', '@media', 'media', 'barWAT' ,'rule'],
          ['rule', 'p, .postcss'],
            ['raw', 'color:red'],
          ['_rule'],
        ['_atrule']
      ])
  })

  o('forward errors', function() {
    var sink = $sink.sink()[0]
    var plgn = j2cPostcss().filter(sink)
    plgn.init()
    plgn.err('foo')
    plgn.rule('p')
    plgn.err('bar')
    plgn._rule()
    o(plgn.done()).deepEquals([
      ['err', 'foo'],
      ['rule', 'p'],
      ['err', 'bar'],
      ['_rule']
    ])
  })


  o('use autoprefixer to remove prefixes', function(){
    o(j2c({plugins: [j2cPostcss(autoprefixer({ add: false, browsers: [] }))]}).sheet({'@global':{
      '@-webkit-keyframes foo': {from:{color:'red'}, to:{color:'pink'}},
      '@keyframes bar': {from:{color:'red'}, to:{color:'pink'}}
    }})).equals('\
@keyframes bar {\n\
from {\n\
color:red;\n\
}\n\
to {\n\
color:pink;\n\
}\n\
}\n'
      )
  })

  o('use the $postcss field to concatenate plugins into as single postCSS processor', function(){
    var plugins = {}
    function makePlugin(name){
      return j2cPostcss(postcss.plugin(name, function () {
        return function(css, result){
          plugins[name] = result.processor.plugins
        }
      }))
    }
    j2c({plugins: [makePlugin('before'), plugin, makePlugin('after')]}).sheet({})
    o(plugins.before).equals(plugins.after)
    o(plugins.before[0].postcssPlugin).equals('before')
    o(plugins.before[2].postcssPlugin).equals('after')
  })

})

// ------------

