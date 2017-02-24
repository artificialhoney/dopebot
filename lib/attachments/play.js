module.exports = function (uri, settings) {
  var text = `Adding ${uri} to tracklist`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
