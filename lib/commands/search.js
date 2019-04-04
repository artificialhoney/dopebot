let defaultTypes = ['album', 'artist', 'track', 'playlist']

function search (argv) {
  let query = argv.query.join(' ')
  let types = argv.types.slice()
  argv.db.logger.info('Searching for "%s" in types:', query, types)

  argv.db.spotify.search(query, types, {
    limit: argv.db.settings.limit,
    offset: 0
  })
    .then(function (data) {
      let maxCount = argv.db.settings.limit
      let typesCount = types.length
      argv.db.search.results = {}
      argv.db.search.hits = 0
      let hit = 0

      while (maxCount > 0 && typesCount > 0) {
        for (let t = 0; t < typesCount; t++) {
          let type = types[t] + 's'
          if (!argv.db.search.results[type]) {
            argv.db.search.results[type] = {
              items: [],
              total: data.body[type].total
            }
          }
          let length = argv.db.search.results[type].items.length

          if (data.body[type].items[length]) {
            argv.db.search.results[type].items[length] = data.body[type].items[length]
            maxCount--
          } else {
            types.splice(t, 1)
            typesCount--
          }
        }
      }

      for (let type in argv.db.search.results) {
        for (let i = 0; i < argv.db.search.results[type].items.length; i++) {
          argv.db.search.results[type].items[i].hit = hit = hit + 1
        }
      }

      argv.db.search.hits = hit
      if (argv.db.search.results.albums && argv.db.search.results.albums.items.length > 0) {
        return argv.db.spotify.getAlbums(argv.db.search.results.albums.items.map(
          function (album) {
            return album.id
          })
        )
      } else {
        return null
      }
    })
    .then(function (data) {
      if (data && data.body) {
        for (let i = 0; i < data.body.albums.length; i++) {
          Object.assign(argv.db.search.results.albums.items[i], data.body.albums[i])
        }
      }
      argv.db.post(argv.db.attachments.search(argv.db.search.results))
    })
    .catch(function (err) {
      argv.db.logger.error(err)
    })
}

module.exports = {
  command: 'search <query..>',
  desc: 'Search Spotify',
  builder: {
    types: {
      alias: 't',
      type: 'array',
      choices: defaultTypes,
      default: defaultTypes,
      desc: 'Spotify resource type'
    }
  },
  handler: function (argv) {
    if (!argv.db.search.expires || argv.db.search.expires <= new Date()) {
      argv.db.logger.info('Retrieve an access token')
      argv.db.spotify.clientCredentialsGrant()
        .then(function (data) {
          argv.db.logger.info('The access token expires in ' + data.body['expires_in'])
          argv.db.search.expires = new Date()
          argv.db.search.expires.setTime(argv.db.search.expires.getTime() + data.body['expires_in'] * 1000)
          argv.db.logger.info('The access token is ' + data.body['access_token'])

          // Save the access token so that it's used in future calls
          argv.db.spotify.setAccessToken(data.body['access_token'])

          search(argv)
        }, function (err) {
          argv.db.logger.error('Something went wrong when retrieving an access token', err)
        })
    } else {
      search(argv)
    }
  }
}
