module.exports = {
  command: 'pause',
  desc: 'Puses the current track',
  handler: function (argv) {
    this.logger.info('Pausing current track')
    this.mopidy.playback.pause()
  }
}
