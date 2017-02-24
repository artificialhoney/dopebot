module.exports = {
  command: 'state',
  desc: 'Gets the current playback state',
  aliases: ['status'],
  handler: function (argv) {
    if (this.settings.history === true) {
      this.updateHistoryState()
    }
    this.post(this.templates.state({state: this.state}))
  }
}
