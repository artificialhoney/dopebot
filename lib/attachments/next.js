module.exports = function (track, settings) {
  var text = ''

  if (track) {
    var formatted = settings.formatTrack(track)
    text = `Next Track: ${formatted.track} from ${formatted.album} by ${formatted.artists}`
  } else {
    text = 'No next track'
  }

  return [{
    'fallback': text,
    'pretext': 'In the current playback mode(s), only the next track can be announced',
    'color': settings.color,
    'title': text
  }]
}
