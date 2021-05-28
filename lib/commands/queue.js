module.exports = {
  command: 'queue <id|uri> [position]',
  desc: 'Enqueues a Spotify resource from the last search results or URI',
  aliases: ['q'],
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
    argv.db.getUrisList(argv, enqueueTracks)
  }
}

function enqueueTracks (argv) {
  argv.db.mopidy.tracklist.add({ tracks: null, at_position: null, uris: argv.uris })
    .then(function (tracks) {
      console.dir(tracks)
      return argv.db.emit('tracklist:add', argv.message, tracks)
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
