module.exports = {
  command: 'shuffle',
  desc: 'Shuffles current tracklist',
  handler: function (argv) {
    var index
    this.mopidy.tracklist.index()
    .then(function (value) {
      if (value === null) {
        throw new Error('Current index not available')
      }
      index = value
      return this.mopidy.tracklist.getLength()
    }.bind(this))
    .then(function (length) {
      this.logger.info('Shuffling tracklist from %d to %d', index + 1, length)
      return this.mopidy.tracklist.shuffle(index + 1, length)
    }.bind(this))
    .catch(function () {})
    .done(function () {
      this.yargs.parse('tracks')
    }.bind(this))
  }
}
