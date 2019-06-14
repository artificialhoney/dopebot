module.exports = function (holder, settings) {
  let state = holder.state.charAt(0).toUpperCase() + holder.state.slice(1)
  state = `${state} with volume ${holder.volume}`
  let modes = Object.keys(holder).filter(key => holder[key] === true).map(key => key)

  if (modes.length > 0) {
    let last = modes.pop()

    if (modes.length > 0) {
      state = `${state} and ${modes.join(', ')}`
    }

    state = `${state} and ${last}`
  }

  let track = 'No current track'
  let formatted

  if (holder.tlTrack) {
    formatted = settings.formatTrack(holder.tlTrack.track)
    track = `${formatted.track} from ${formatted.album}`
    if (holder.history && holder.history.user && holder.history.user.name) {
       track = `${track} added by ${holder.history.user.name}`
    }
  }

  let fallback = holder.tlTrack ? `${holder.tlTrack.track.artists[0].name}: ${holder.tlTrack.track.name}` : track

  return [{
    'fallback': `${state}: ${fallback}`,
    'color': settings.color,
    'pretext': `${state}`,
    'title': track,
    'text': holder.tlTrack ? formatted.artists : ''
  }]
}
