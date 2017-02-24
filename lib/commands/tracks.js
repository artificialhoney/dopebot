module.exports = {
  command: 'tracks',
  desc: 'Prints out the current tracklist',
  aliases: ['list'],
  handler: function (argv) {
    if (this.state.random || (this.state.repeat && this.state.single) || this.state.single) {
      this.logger.info('Getting next track')
      this.mopidy.tracklist.nextTrack(this.state.tlTrack)
      .done(function (tlTrack) {
        if (this.settings.history === true) {
          tlTrack.history = this.getHistoryState(tlTrack.tlid)
        }

        this.post(this.templates.next_track(tlTrack))
      }.bind(this))
      return
    }

    this.logger.info('Getting current tracklist')
    var index, length
    this.mopidy.tracklist.index()
    .then(function (value) {
      if (value === null) {
        throw new Error('Current index not available')
      }
      index = value
      return this.mopidy.tracklist.getLength()
    }.bind(this))
    .then(function (value) {
      length = value
      return this.mopidy.tracklist.slice(index, index + 10)
    }.bind(this))
    .catch(function () {})
    .done(function (tlTracks) {
      tlTracks = tlTracks || []
      tlTracks = tlTracks.map(function (currentValue, i) {
        currentValue.index = index + i
        if (this.settings.history === true) {
          currentValue.history = this.getHistoryState(currentValue.tlid)
        }
        return currentValue
      }, this)
      this.post(this.templates.tracks({tlTracks: tlTracks, length: length}))
    }.bind(this))
  }
}
