module.exports = {
  command: 'volume [amount|direction]',
  desc: 'Getting / Setting the volume',
  aliases: ['vol'],
  handler: function (argv) {
    if (argv.amount) {
      if (['up', 'down'].includes(argv.amount)) {
        argv.amount = parseInt(this.state.volume) + (argv.amount === 'up' ? 5 : -5)
      }
      argv.amount = parseInt(argv.amount)
      this.logger.info('Setting volume to %d', argv.amount)
      this.mopidy.mixer.setVolume(argv.amount)
      .done(function (volume) {
        this.yargs.parse('vol')
      }.bind(this))
    } else {
      this.logger.info('Getting volume')
      this.mopidy.mixer.getVolume()
      .done(function (volume) {
        this.post(this.templates.volume({volume: volume}))
      }.bind(this))
    }
  }
}
