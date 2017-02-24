module.exports = {
  command: 'stop',
  desc: 'Stops playback',
  handler: function (argv) {
    this.logger.info('Stopping playback')
    this.mopidy.playback.stop()
  }
}
