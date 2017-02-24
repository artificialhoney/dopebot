module.exports = {
  command: 'prev',
  desc: 'Plays the previous track from the tracklist',
  handler: function (argv) {
    this.logger.info('Playing previous track')
    this.mopidy.playback.previous()
  }
}
