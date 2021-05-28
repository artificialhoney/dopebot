module.exports = {
  command: 'play [id|uri]',
  desc: 'Plays a Spotify resource from the last search results or URI',
  aliases: ['p'],
  handler: function (argv) {
    if (!argv.id) {
      argv.db.logger.info('Playing tracklist')
      argv.db.mopidy.playback.play()
      return
    }

    argv.db.getUrisList(argv, addTracks)
  }
}

function addTracks (argv) {
  argv.db.logger.info('Clearing tracklist')
  argv.db.mopidy.tracklist.clear()
    .then(function () {
      argv.db.emit('tracklist:clear')
      return argv.db.mopidy.tracklist.add({ tracks: null, at_position: null, uris: argv.uris })
    })
    .then(function (tracks) {
      argv.db.emit('tracklist:add', argv.message, tracks)
      return argv.db.mopidy.playback.play()
    })
    .catch(function (e) {
      console.dir(e)
    })
    .then(function () {
      if (argv.uri === null) {
        argv.uri = argv.uris.length + ' tracks'
      }
      argv.db.post(argv.db.attachments.play(argv.uri))
    })
}
