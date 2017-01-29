var postcss = require('postcss')

var own = {}.hasOwnProperty


module.exports = function(plugin) {
  // cache the PostCSS processor. Its creation is delayed so that
  // more plugins can be added through $postcss
  var processor

  return {filter: function(next) {

    function unknownBlock(type){
      /* istanbul ignore next */
      next.err('j2c-plugin-postcss doesn\'t know how to handle PostCSS nodes of type "' + type + '".')
    }
    // combines successive `j2c-postcss-plugin`-based plugins for efficiency.
    if (own.call(next,'$postcss')) return next.$postcss(plugin)

    var plugins = plugin ? [plugin] : []
    var parent, root, done, inRule

    // `handlers` and `block` turn the PostCSS tree into
    // j2c streams after processing.
    var handlers = {
      atrule: function (node) {
        var kind = node.name.replace(/^-[a-zA-Z_]\w+-/, '')
        if (node.nodes) {
          var params = ''
          if (node.params) {
            params = node.params
          }
          next.atrule('@'+node.name, kind, params, node.raws ? node.raws.j2cBlock || true : true)
          block(node.nodes)
          next._atrule()
        } else {
          next.atrule('@'+node.name, kind, node.params)
        }
      },
      comment: function(){},
      decl: function (node) {
        if (own.call(node, 'raws') && own.call(node.raws, 'j2cRaw')) next.raw(node.raws.j2cRaw)
        else if (own.call(node, 'raws') && own.call(node.raws, 'j2cErr')) next.err(node.raws.j2cErr)
        else next.decl(node.prop, node.value)
      },
      rule: function (node) {
        if (own.call(node, 'raws') && own.call(node.raws, 'j2cRaw')) next.raw(node.raws.j2cRaw)
        else if (own.call(node, 'raws') && own.call(node.raws, 'j2cErr')) next.err(node.raws.j2cErr)
        else {
          next.rule(node.selector)
          block(node.nodes)
          next._rule()
        }
      }
    }

    function block(nodes) {
      nodes.forEach(function (node) {
        (handlers[node.type]||unknownBlock(node.type))(node)
      })
    }

    // These filters turn the streams into a PostCSS tree.
    // Once done, `this.x()` turns back the tree into a
    // series of streams.
    return {
      $postcss: function(plugin) {
        plugins = [plugin].concat(plugins)
        return this
      },
      init: function(){
        parent = postcss.root()
        root = parent
        done = false
        inRule = false
        next.init()
      },
      done: function() {
        if (!done) {
          done = true
          // initialize the processor if needed
          processor = processor || postcss(plugins)
          if (root !== parent) throw new Error("Missing '}'")
          var options = {stringifier: function () {}}
          var result = root.toResult(options)

          // process and convert back to j2c streams
          block(processor.process(result, options).root.nodes)
        }
        return next.done()
      },
      // Use custom properties to pass raw declarations through the plugins unaltered
      err: function(msg) {
        if (inRule) parent.push(postcss.decl({prop: 'j2c-err', value: 'j2c-err', raws: {j2cErr: msg}}))
        else parent.push(postcss.rule({selector: 'j2c-err', raws:{j2cErr: msg}, nodes: [
          postcss.decl({prop: 'color', value: 'red'})
        ]}))
      },
      raw: function(txt) {
        if (inRule) parent.push(postcss.decl({prop: 'j2c-raw', value: 'j2c-raw', raws: {j2cRaw: txt}}))
        else parent.push(postcss.rule({selector: 'j2c-raw', raws: {j2cRaw: txt}, nodes: [
          postcss.decl({prop: 'color', value: 'red'})
        ]}))
      },
      atrule: function(rule, kind, params, takesBlock) {
        var node = {name: rule.slice(1), raws: {j2cBlock: takesBlock}}
        if (params !== '') node.params = params
        node = postcss.atRule(node)
        parent.push(node)
        if (takesBlock) {
          if (takesBlock == 'decl') inRule = true
          node.nodes = []
          parent = node
        }
      },
      _atrule: function () {
        inRule = false
        parent = parent.parent
      },
      decl: function (prop, value) {
        parent.push(postcss.decl({prop: prop, value: value}))
      },
      rule: function (selector) {
        inRule = true
        var rule = postcss.rule({selector: selector})
        parent.push(rule)
        parent = rule
      },
      _rule: function () {
        inRule = false
        parent = parent.parent
      }
    }
  }}
}
