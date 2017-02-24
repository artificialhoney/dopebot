module.exports = {
  command: 'next',
  desc: 'Plays the next track from the tracklist',
  aliases: ['skip'],
  handler: function (argv) {
    argv.db.logger.info('Playing next track')
    argv.db.mopidy.playback.next()
  }
}
