module.exports = {
  command: 'mode <mode> [enable]',
  desc: 'Getting / Setting a specific mode state',
  builder: {
    mode: {
      desc: 'The playback mode',
      choices: ['consume', 'random', 'repeat', 'single']
    },
    enable: {
      type: 'boolean',
      desc: 'The enabled state of the mode'
    }
  },
  handler: function (argv) {
    let mode = argv.mode.charAt(0).toUpperCase() + argv.mode.slice(1)
    if (argv.state) {
      argv.db.logger.info('Setting %s mode to %s', argv.mode, argv.enable)
      argv.db.mopidy.tracklist['set' + mode]([argv.enable === 'true'])
        .then(function (value) {
          argv.db.post(argv.db.attachments.mode(argv.mode, value))
        })
    } else {
      argv.db.mopidy.tracklist['get' + mode]()
        .then(function (value) {
          argv.db.post(argv.db.attachments.mode(argv.mode, value))
        })
    }
  }
}
