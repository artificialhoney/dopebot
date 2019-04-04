module.exports = function (mode, value, settings) {
  let text = `${mode}: ${value}`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
