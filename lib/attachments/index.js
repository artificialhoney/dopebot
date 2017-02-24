module.exports = function (settings) {
  return {
    help: function (commands, value) {
      return require('./help')(commands, settings)
    },
    mode: function (mode, value) {
      return require('./mode')(mode, value, settings)
    },
    next: function (track) {
      return require('./next')(track, settings)
    },
    play: function (uri) {
      return require('./play')(uri, settings)
    },
    search: function (result) {
      return require('./search')(result, settings)
    },
    state: function (holder) {
      return require('./state')(holder, settings)
    },
    tracks: function (tracks, length) {
      return require('./tracks')(tracks, length, settings)
    },
    volume: function (value) {
      return require('./volume')(value, settings)
    }
  }
}
