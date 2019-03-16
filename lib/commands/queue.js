module.exports = {
  command: 'queue <id|uri> [position]',
  desc: 'Enqueues a Spotify resource from the last search results or URI',
  builder: {
    uri: {
      desc: 'Spotify URI'
    },
    position: {
      type: 'number',
      desc: 'Tracklist position'
    }
  },
  handler: function (argv) {
    if (Number.isInteger(argv.id)) {
      for (var type in argv.db.search.results) {
        for (var i = 0; i < argv.db.search.results[type].items.length; i++) {
          if (argv.db.search.results[type].items[i].hit === argv.id) {
            argv.uri = argv.db.search.results[type].items[i].uri

            // Workaround for playlist uris missing the owner id
            if (argv.db.search.results[type].items[i].type === 'playlist') {
              if (!argv.uri.match(/spotify:user:[\w]+:playlist:[a-zA-Z0-9]{22}/)) {
                argv.uri = argv.uri.replace(/^spotify/, argv.db.search.results[type].items[i].owner.uri)
                argv.db.logger.info('Fixing playlist uri by adding owner: ' + argv.uri)
              }
            }
          }
        }
      }
    }

    if (typeof argv.uri !== 'string' || !argv.uri.match(/spotify:[\w\.-_:]+[a-zA-Z0-9]{22}/)) {
      argv.db.logger.warn('Ignoring unsupported uri: ' + argv.uri)
      argv.db.post('Ignoring unsupported uri: ' + argv.uri)
      return
    }

    if (matches = argv.uri.match(/spotify:user:(\w+):playlist:([a-zA-Z0-9]{22})/)) {
      user = matches[1]
      playlist = matches[2]
      argv.db.logger.info('Adding playlist of user \'' + user + '\': ' + playlist)

      argv.uri = null
      argv.uris = []
      handlePlaylist(argv, user, playlist)
      return
    }

    enqueueTracks(argv)
  }
}

function enqueueTracks(argv) {
  argv.db.mopidy.tracklist.add(null, parseInt(argv.position), argv.uri, argv.uris)
  .then(function (tracks) {
    console.dir(tracks)
    return argv.db.emit('tracklist:add', argv.message, tracks)
  })
  .catch(function (e) {
    console.dir(e)
  })
  .done(function () {
    if (argv.uri === null) {
      argv.uri = argv.uris.length + ' tracks'
    }
    argv.db.post(argv.db.attachments.play(argv.uri))
  })
}

function handlePlaylist(argv, user, playlist) {
  if (!argv.db.search.expires || argv.db.search.expires <= new Date()) {
    argv.db.logger.info('Retrieve an access token')
    argv.db.spotify.clientCredentialsGrant()
    .then(function(data) {
      argv.db.logger.info('The access token expires in ' + data.body['expires_in'])
      argv.db.search.expires = new Date()
      argv.db.search.expires.setTime(argv.db.search.expires.getTime() + data.body['expires_in'] * 1000)
      argv.db.logger.info('The access token is ' + data.body['access_token'])

      // Save the access token so that it's used in future calls
      argv.db.spotify.setAccessToken(data.body['access_token'])

      lookupPlaylist(argv, user, playlist, 0)
    }
    , function(err) {
        argv.db.logger.error('Something went wrong when retrieving an access token', err);
    })
  } else {
    lookupPlaylist(argv, user, playlist, 0)
  }
}

function lookupPlaylist(argv, user, playlist, offset) {
  argv.db.logger.info('Looking up playlist tracks ' + (offset+1) + '-' + (offset+100))

  argv.db.spotify.getPlaylistTracks(user, playlist, {offset: offset, limit: 100, fields: 'items,total'})
  .then(function(data) {
    for (var i = 0; i < data.body.items.length; i++) {
      argv.uris.push(data.body.items[i].track.uri)
    }
    if (argv.uris.length < data.body.total) {
      lookupPlaylist(argv, user, playlist, offset+100)
    } else {
      argv.db.logger.info('Adding a total of ' + argv.uris.length + ' tracks to the tracklist')
      enqueueTracks(argv)
    }
  }
  , function (err) {
    argv.db.logger.error('Something went wrong when loading the playlist tracks', err)
  })
}
