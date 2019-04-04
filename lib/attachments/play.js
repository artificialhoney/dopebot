module.exports = function (uri, settings) {
  let text = `Adding ${uri} to tracklist`

  return [{
    'fallback': text,
    'color': settings.color,
    'title': text
  }]
}
