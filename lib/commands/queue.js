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
      for (var type in this.search.results) {
        for (var i = 0; i < this.search.results[type].items.length; i++) {
          if (this.search.results[type].items[i].hit === argv.id) {
            argv.uri = this.search.results[type].items[i].uri
            break
          }
        }
      }
    }

    if (typeof argv.uri !== 'string' || !argv.uri.match(/spotify:[\w:]+[a-zA-Z0-9]{22}/)) {
      return
    }

    this.mopidy.tracklist.add(null, parseInt(argv.position), argv.uri)
    .then(function (tracks) {
      this.emit('tracklist:add', argv.message, tracks)
      return this.mopidy.playback.play()
    }.bind(this))
    .catch(function () {})
    .done(function () {
      this.post(this.templates.play({uri: argv.uri}))
    }.bind(this))
  }
}
