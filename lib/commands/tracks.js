module.exports = {
  command: 'tracks',
  desc: 'Prints out the current tracklist',
  aliases: ['list'],
  handler: function (argv) {
    if (argv.db.state.random || (argv.db.state.repeat && argv.db.state.single) || argv.db.state.single) {
      argv.db.logger.info('Getting next track')
      argv.db.mopidy.tracklist.nextTrack(argv.db.state.tlTrack)
      .done(function (tlTrack) {
        if (argv.db.settings.history === true) {
          tlTrack.history = argv.db.getHistoryState(tlTrack.tlid)
        }

        argv.db.post(argv.db.templates.next_track(tlTrack))
      })
      return
    }

    argv.db.logger.info('Getting current tracklist')
    var index, length
    argv.db.mopidy.tracklist.index()
    .then(function (value) {
      if (value === null) {
        throw new Error('Current index not available')
      }
      index = value
      return argv.db.mopidy.tracklist.getLength()
    })
    .then(function (value) {
      length = value
      return argv.db.mopidy.tracklist.slice(index, index + 10)
    })
    .catch(function () {})
    .done(function (tlTracks) {
      tlTracks = tlTracks || []
      tlTracks = tlTracks.map(function (currentValue, i) {
        currentValue.index = index + i
        if (argv.db.settings.history === true) {
          currentValue.history = argv.db.getHistoryState(currentValue.tlid)
        }
        return currentValue
      }, this)
      argv.db.post(argv.db.templates.tracks({tlTracks: tlTracks, length: length}))
    })
  }
}
