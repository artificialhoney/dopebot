module.exports = {
  command: 'prev',
  desc: 'Plays the previous track from the tracklist',
  handler: function (argv) {
    argv.db.logger.info('Playing previous track')
    argv.db.mopidy.playback.previous()
  }
}
