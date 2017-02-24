module.exports = {
  command: 'resume',
  desc: 'Resumes the current track',
  handler: function (argv) {
    argv.db.logger.info('Resuming current track')
    argv.db.mopidy.playback.resume()
  }
}
