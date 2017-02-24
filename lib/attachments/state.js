module.exports = function (holder, settings) {
  var state = holder.state.charAt(0).toUpperCase() + holder.state.slice(1)
  state = `${state} with volume ${holder.volume}`
  var modes = Object.keys(holder).filter(key => holder[key] === true).map(key => key)

  if (modes.length > 0) {
    var last = modes.pop()

    if (modes.length > 0) {
      state = `${state} and ${modes.join(', ')}`
    }

    state = `${state} and ${last}`
  }

  var track = 'No current track'

  if (holder.tlTrack) {
    var formatted = settings.formatTrack(holder.tlTrack.track)
    track = `${formatted.track} from ${formatted.album}`
    if (holder.history) {
      track = `${track} added by ${holder.history.user.name}`
    }
  }

  var fallback = holder.tlTrack ? `${holder.tlTrack.track.artists[0].name}: ${holder.tlTrack.track.name}` : track

  return [{
    'fallback': `${state}: ${fallback}`,
    'color': settings.color,
    'pretext': `${state}`,
    'title': track,
    'text': holder.tlTrack ? formatted.artists : ''
  }]
}
