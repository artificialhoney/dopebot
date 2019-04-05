module.exports = function (value, settings) {
  let text = `Volume: ${value}`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
