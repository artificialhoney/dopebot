module.exports = {
  command: 'next',
  desc: 'Plays the next track from the tracklist',
  aliases: ['skip'],
  handler: function (argv) {
    this.logger.info('Playing next track')
    this.mopidy.playback.next()
  }
}
