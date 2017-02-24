module.exports = function (mode, value, settings) {
  var text = `${mode}: ${value}`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
