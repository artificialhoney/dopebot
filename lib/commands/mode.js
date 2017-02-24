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
    var mode = argv.mode.charAt(0).toUpperCase() + argv.mode.slice(1)
    if (argv.state) {
      this.logger.info('Setting %s mode to %s', argv.mode, argv.enable)
      this.mopidy.tracklist['set' + mode](argv.enable === 'true')
      .done(function () {
        this.yargs.parse(['mode', argv.mode])
      }.bind(this))
    } else {
      this.mopidy.tracklist['get' + mode]()
      .done(function (value) {
        this.post(this.templates.mode({mode: argv.mode, value: value}))
      }.bind(this))
    }
  }
}
