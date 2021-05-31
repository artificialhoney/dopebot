module.exports = function (tracks, length, settings) {
  let text = ''
  let title = ''

  if (tracks.length > 0) {
    title = `Next ${tracks.length} tracks of ${length}`

    tracks.forEach(function (tlTrack, index) {
      let formatted = settings.formatTrack(tlTrack.track)

      if (tlTrack.track.uri.match(/(youtube:video:)([\w\-]+)/)) {
        text = `${text}\nTrack ${tlTrack.index}: ${formatted.track}`
      } else {
        text = `${text}\nTrack ${tlTrack.index}: ${formatted.track} from ${formatted.album} by ${formatted.artists}`
      }
    })
  } else {
    title = 'Tracklist empty'
  }

  return [{
    'fallback': title,
    'color': settings.color,
    'title': title,
    'text': text
  }]
}
