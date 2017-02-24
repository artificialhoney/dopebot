module.exports = {
  command: 'prev',
  desc: 'Clears the tracklist',
  handler: function (argv) {
    this.logger.info('Clearing current tracklist')
    this.mopidy.tracklist.clear()
    .done(function () {
      this.emit('tracklist:clear')
    }.bind(this))
  }
}
