module.exports = {
  command: 'prev',
  desc: 'Clears the tracklist',
  handler: function (argv) {
    argv.db.logger.info('Clearing current tracklist')
    argv.db.mopidy.tracklist.clear()
    .done(function () {
      argv.db.emit('tracklist:clear')
    })
  }
}
