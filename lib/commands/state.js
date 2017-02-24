module.exports = {
  command: 'state',
  desc: 'Gets the current playback state',
  aliases: ['status'],
  handler: function (argv) {
    if (argv.db.settings.history === true) {
      argv.db.updateHistoryState()
    }
    argv.db.post(argv.db.attachments.state(argv.db.state))
  }
}
