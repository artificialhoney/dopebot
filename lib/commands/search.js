var types = ['album', 'artist', 'track', 'playlist']

module.exports = {
  command: 'search <query..>',
  desc: 'Search Spotify',
  builder: {
    types: {
      alias: 't',
      type: 'array',
      choices: types,
      default: types,
      desc: 'Spotify resource type'
    }
  },
  handler: function (argv) {
    argv.query = argv.query.join(' ')
    this.logger.info('Searching for "%s" in types:', argv.query, argv.types)

    this.spotify.search(argv.query, argv.types, {
      limit: this.settings.limit,
      offset: 0
    })
    .then(function (data) {
      var maxCount = this.settings.limit
      var typesCount = argv.types.length
      var hit = 0

      while (maxCount > 0 && typesCount > 0) {
        for (var t = 0; t < typesCount; t++) {
          var type = argv.types[t] + 's'
          if (!this.search.results[type]) {
            this.search.results[type] = {
              items: [],
              total: data.body[type].total
            }
          }
          var length = this.search.results[type].items.length

          if (data.body[type].items[length]) {
            this.search.results[type].items[length] = data.body[type].items[length]
            maxCount--
          } else {
            argv.types.splice(t, 1)
            typesCount--
          }
        }
      }

      for (type in this.search.results) {
        for (var i = 0; i < this.search.results[type].items.length; i++) {
          this.search.results[type].items[i].hit = hit = hit + 1
        }
      }

      this.search.hits = hit
      if (this.search.results.albums && this.search.results.albums.items.length > 0) {
        return this.spotify.getAlbums(this.search.results.albums.items.map(
          function (album) {
            return album.id
          })
        )
      } else {
        return null
      }
    }.bind(this))
    .then(function (data) {
      if (data && data.body) {
        for (var i = 0; i < data.body.albums.length; i++) {
          Object.assign(this.search.results.albums.items[i], data.body.albums[i])
        }
      }
      this.post(this.templates.search(this.search.results))
    }.bind(this))
    .catch(function (err) {
      this.logger.error(err)
    }.bind(this))
  }
}
