module.exports = {
  command: 'resume',
  desc: 'Resumes the current track',
  handler: function (argv) {
    this.logger.info('Resuming current track')
    this.mopidy.playback.resume()
  }
}
