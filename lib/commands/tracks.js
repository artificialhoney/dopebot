module.exports = {
  command: 'tracks [length]',
  desc: 'Prints out the current tracklist',
  aliases: ['list'],
  builder: {
    length: {
      type: 'number',
      desc: 'Number of tracks to output',
      default: 10
    }
  },
  handler: function (argv) {
    if (argv.db.state.random || (argv.db.state.repeat && argv.db.state.single) || argv.db.state.single) {
      argv.db.logger.info('Getting next track')
      argv.db.mopidy.tracklist.nextTrack([argv.db.state.tlTrack])
        .then(function (tlTrack) {
          if (argv.db.settings.history === true) {
            tlTrack.history = argv.db.getHistoryState(tlTrack.tlid)
          }

          argv.db.post(argv.db.attachments.next(tlTrack))
        })
      return
    }

    argv.db.logger.info('Getting current tracklist')
    let index, length
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
        return argv.db.mopidy.tracklist.slice([index, index + parseInt(argv.length)])
      })
      .catch(function () {})
      .then(function (tlTracks) {
        tlTracks = tlTracks || []
        tlTracks = tlTracks.map(function (currentValue, i) {
          currentValue.index = index + i
          if (argv.db.settings.history === true) {
            currentValue.history = argv.db.getHistoryState(currentValue.tlid)
          }
          return currentValue
        }, this)
        argv.db.post(argv.db.attachments.tracks(tlTracks, length))
      })
  }
}
