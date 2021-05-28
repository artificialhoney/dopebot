module.exports = {
  playlistHandler
}

function playlistHandler (argv, playlist, callback) {
  if (!argv.db.search.expires || argv.db.search.expires <= new Date()) {
    argv.db.logger.info('Retrieve an access token')
    argv.db.spotify.clientCredentialsGrant()
      .then(function (data) {
        argv.db.logger.info('The access token expires in ' + data.body.expires_in)
        argv.db.search.expires = new Date()
        argv.db.search.expires.setTime(argv.db.search.expires.getTime() + data.body.expires_in * 1000)
        argv.db.logger.info('The access token is ' + data.body.access_token)

        // Save the access token so that it's used in future calls
        argv.db.spotify.setAccessToken(data.body.access_token)

        lookupPlaylist(argv, playlist, 0, callback)
      }
      , function (err) {
        argv.db.logger.error('Something went wrong when retrieving an access token', err)
      })
  } else {
    lookupPlaylist(argv, playlist, 0, callback)
  }
}

function lookupPlaylist (argv, playlist, offset, callback) {
  argv.db.logger.info('Looking up playlist tracks ' + (offset + 1) + '-' + (offset + 100))

  argv.db.spotify.getPlaylistTracks(playlist, { offset: offset, limit: 100, fields: 'items,total' })
    .then(function (data) {
      for (let i = 0; i < data.body.items.length; i++) {
        argv.uris.push(data.body.items[i].track.uri)
      }

      console.log(argv.db.search.results.tracks.items)
      if (argv.uris.length < data.body.total) {
        lookupPlaylist(argv, playlist, offset + 100, callback)
      } else {
        argv.db.logger.info('Adding a total of ' + argv.uris.length + ' tracks to the tracklist')
        callback(argv)
      }
    }
    , function (err) {
      argv.db.logger.error('Something went wrong when loading the playlist tracks', err)
    })
}
