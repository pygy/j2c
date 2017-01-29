/*eslint no-console: 0*/
var childProcess = require('child_process')

var fs = require('fs')
var path = require('path')

var cwd = process.cwd()
var env = process.env
var isWin = /^win/.test(process.platform)

function runCmd(cmd, args = [], options = {}, result = {output: '', status: null, stderr: '', stdout: ''}) {
  options = Object.assign({}, options, {cwd: options.cwd || path.join(cwd, options.path), env, shell: isWin})
  return new Promise(function(fulfil, reject) {
    const proc = childProcess.spawn(cmd, args, options)
    const interval = setInterval(function(){
      if(result.output !== '') {
        console.log(result.output)
        result.output = ''
      }
    }, 10000)
    proc.on('exit', function(status){
      clearInterval(interval)
      result.status = status
      if(status === 0) fulfil(result)
      else reject(result)
    })
    proc.stdout.on('data', function(data) {
      data = String(data)
      result.stdout += data
      result.output += data
    })
    proc.stderr.on('data', function(data) {
      data = String(data)
      result.stderr += data
      result.output += data
    })
  })
}

Promise.all(fs.readdirSync('plugins').map(function(dir){
  return runCmd('yarn', [], {path: 'plugins/'+dir}).then(
    result => runCmd('yarn', ['run build'],  {path: 'plugins/'+dir}, result).catch(()=>({output:'nothing to build\n'}))
  )
})).then(
  function ok(results) {
    results.forEach(res => console.log(res && res.output))
    // process.exit(results[0] ? results[0].status : 0)
  },
  function caught(res){
    console.error('error',res.output)
    process.exit(res.status)
  }
).catch(function(e){
  console.error(e && e.stack)
  process.exit(1)
})
