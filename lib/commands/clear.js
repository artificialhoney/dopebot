module.exports = {
  command: 'clear',
  desc: 'Clears the tracklist',
  aliases: ['clean'],
  handler: function (argv) {
    argv.db.logger.info('Clearing current tracklist')
    argv.db.mopidy.tracklist.clear()
      .then(function () {
        argv.db.emit('tracklist:clear')
      })
  }
}
