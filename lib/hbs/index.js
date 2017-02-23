var handlebars = require('handlebars')
var path = require('path')
var fs = require('fs')
var templates = {}

fs.readdirSync(__dirname).forEach(function (file) {
  if (path.extname(file) === '.hbs') {
    templates[path.basename(file, '.hbs')] = handlebars.compile(fs.readFileSync(path.join(__dirname, file), 'utf8'))
  }
})

module.exports = templates
