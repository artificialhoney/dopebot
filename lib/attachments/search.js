module.exports = function (result, settings) {
  function nothingFound (title) {
    return {
      'fallback': title,
      'color': settings.color,
      'title': title
    }
  }

  let title
  let attachments = []

  if (result.albums) {
    if (result.albums.items.length > 0) {
      title = `${result.albums.items.length} albums of ${result.albums.total}`
      attachments.push({
        'fallback': title,
        'color': settings.color,
        'title': title,
        'text': result.albums.items.reduce(function (str, album) {
          let artists = album.artists.map(artist => `<${artist.uri}|${artist.name}>`).join(', ')
          return `${str}\n${album.hit}: <${album.uri}|${album.name}> by ${artists} on ${album.release_date}`
        }, '')
      })
    } else {
      attachments.push(nothingFound('No albums found'))
    }
  }

  if (result.artists) {
    if (result.artists.items.length > 0) {
      title = `${result.artists.items.length} artists of ${result.artists.total}`
      attachments.push({
        'fallback': title,
        'color': settings.color,
        'title': title,
        'text': result.artists.items.reduce(function (str, artist) {
          return `${str}\n${artist.hit}: <${artist.uri}|${artist.name}>`
        }, '')
      })
    } else {
      attachments.push(nothingFound('No artists found'))
    }
  }

  if (result.tracks) {
    if (result.tracks.items.length > 0) {
      title = `${result.tracks.items.length} tracks of ${result.tracks.total}`
      attachments.push({
        'fallback': title,
        'color': settings.color,
        'title': title,
        'text': result.tracks.items.reduce(function (str, track) {
          let artists = track.artists.map(artist => `<${artist.uri}|${artist.name}>`).join(', ')
          return `${str}\n${track.hit}: <${track.uri}|${track.name}> by ${artists} from <${track.album.uri}|${track.album.name}>`
        }, '')
      })
    } else {
      attachments.push(nothingFound('No tracks found'))
    }
  }

  if (result.playlists) {
    if (result.playlists.items.length > 0) {
      title = `${result.playlists.items.length} playlists of ${result.playlists.total}`
      attachments.push({
        'fallback': title,
        'color': settings.color,
        'title': title,
        'text': result.playlists.items.reduce(function (str, playlist) {
          return `${str}\n${playlist.hit}: <${playlist.uri}|${playlist.name}> by <${playlist.owner.uri}|${playlist.owner.id}>`
        }, '')
      })
    } else {
      attachments.push(nothingFound('No playlists found'))
    }
  }

  return attachments
}
