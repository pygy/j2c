#! /usr/bin/env node

/*eslint-env node*/
/*eslint no-console: 0*/

var fs = require('fs'),
  rollup = require('rollup'),
  uglify = require('uglify-js'),
  zlib = require('zlib'),
  outputs = [
    {
      rollupOptions:{
        format: 'iife',
        moduleName: 'J2c'
      },
      name: 'global',
      minify: {saveGzip:true}
    },
    {
      rollupOptions:{
        format: 'cjs'
      },
      name: 'commonjs',
      minify: {save:true}
    },
    { // not sure this one is necessary by now...
      rollupOptions:{
        format: 'es'
      },
      name: 'es6',
      minify: false // ATM, uglify chokes on the export statement.
    },
    {
      rollupOptions:{
        format: 'amd',
        name: 'j2c'
      },
      name: 'amd',
      minify: {save:true}
    }
  ],
  commonRollupOptions = {
    sourceMap: true,
    banner: ''
  },
  parsed = rollup.rollup({
    entry: 'src/main.js'
  })


outputs.forEach(function (output) {
  parsed.then(function(bundle){
    var result = bundle.generate(Object.assign({}, output.rollupOptions, commonRollupOptions))
    fs.writeFileSync('dist/j2c.' + output.name + '.js', result.code) //+'\n//'+result.map.toUrl()
    if (output.minify) {
      var minified = uglify.minify(result.code, {
        fromString: true,
        mangle: true,
        compress: {}
      }).code
      fs.writeFileSync('dist/j2c.' + output.name + '.min.js', minified)
      zlib.gzip(minified, function(_, buf){
        console.log(output.name, _ || buf.length)
        if (output.minify.saveGzip) {
          fs.writeFileSync('dist/j2c.' + output.name + '.min.js.gz', buf)
        }
      })
    }
  }).then(null, function (e) {
    console.log(output.name, e)
    process.exit(1)
  })
})
