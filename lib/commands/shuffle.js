module.exports = {
  command: 'shuffle',
  desc: 'Shuffles current tracklist',
  handler: function (argv) {
    let index
    argv.db.mopidy.tracklist.index()
      .then(function (value) {
        if (value === null) {
          throw new Error('Current index not available')
        }
        index = value
        return argv.db.mopidy.tracklist.getLength()
      })
      .then(function (length) {
        argv.db.logger.info('Shuffling tracklist from %d to %d', index + 1, length)
        return argv.db.mopidy.tracklist.shuffle([index + 1, length])
      })
      .catch(function () {})
      .then(function () {
        argv.db.yargs.parse('tracks', {
          db: argv.db
        })
      })
  }
}
