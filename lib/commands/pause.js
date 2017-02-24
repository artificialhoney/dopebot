module.exports = {
  command: 'pause',
  desc: 'Puses the current track',
  handler: function (argv) {
    argv.db.logger.info('Pausing current track')
    argv.db.mopidy.playback.pause()
  }
}
