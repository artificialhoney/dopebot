module.exports = {
  command: 'stop',
  desc: 'Stops playback',
  handler: function (argv) {
    argv.db.logger.info('Stopping playback')
    argv.db.mopidy.playback.stop()
  }
}
