'use strict'
var gutil = require('gulp-util')
var through = require('through2')
var rcu = require('rcu')
var rcuBuilders = require('rcu-builders')
var ractive = require('ractive')

rcu.init(ractive)

/**
 * convert ractive single file component to js
 * @param options.moduleFormat {String} amd/cmd/es6
 * @param options.onCompile {Function}
 */
function compile(options) {
  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file)
      return
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-trac', 'Streaming not supported'))
      return
    }

    try {
      var html = file.contents.toString()
      var component = rcu.parse(html)
      var result = rcuBuilders[options.moduleFormat || 'amd'].call(rcuBuilders, component)
      if (typeof options.onCompile === 'function') {
        result = options.onCompile.call(null, {
          content: result
        })
      }

      file.contents = new Buffer(result)

      this.push(file)
    } catch (err) {
      this.emit('error', new gutil.PluginError('gulp-trac', err, {fileName: file.path}))
    }

    cb()
  })
}

module.exports = compile
