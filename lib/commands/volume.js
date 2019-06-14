module.exports = {
  command: 'volume [amount|direction]',
  desc: 'Getting / Setting the volume',
  aliases: ['vol'],
  handler: function (argv) {
    if (argv.amount) {
      if (['up', 'down'].includes(argv.amount)) {
        argv.amount = parseInt(argv.db.state.volume) + (argv.amount === 'up' ? 5 : -5);
      }

      if(isNaN(argv.amount)) {
        argv.db.post(`${argv.amount} is not a number`);
        return;
      }

      argv.amount = parseInt(argv.amount)
      argv.amount = Math.max(Math.min(argv.amount, 100), 0);

      argv.db.logger.info('Setting volume to %d', argv.amount)
      argv.db.mopidy.mixer.setVolume([argv.amount])
        .then(function (volume) {
          argv.db.post(argv.db.attachments.volume(argv.amount))
        })
    } else {
      argv.db.logger.info('Getting volume')
      argv.db.mopidy.mixer.getVolume()
        .then(function (volume) {
          argv.db.post(argv.db.attachments.volume(volume))
        })
    }
  }
}
