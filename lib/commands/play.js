module.exports = {
  command: 'play [id|uri]',
  desc: 'Plays a Spotify resource from the last search results or URI',
  handler: function (argv) {
    if (!argv.id) {
      this.logger.info('Playing tracklist')
      this.mopidy.playback.play()
      return
    }

    if (Number.isInteger(argv.id)) {
      for (var type in this.search.results) {
        for (var i = 0; i < this.search.results[type].items.length; i++) {
          if (this.search.results[type].items[i].hit === argv.id) {
            argv.uri = this.search.results[type].items[i].uri
          }
        }
      }
    }

    if (typeof argv.uri !== 'string' || !argv.uri.match(/spotify:[\w:]+[a-zA-Z0-9]{22}/)) {
      return
    }

    this.logger.info('Clearing tracklist')
    this.mopidy.tracklist.clear()
    .then(function () {
      this.emit('tracklist:clear')
      return this.mopidy.tracklist.add(null, null, argv.uri)
    }.bind(this))
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
