module.exports = function (value, settings) {
  var text = `Volume: ${value}`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
