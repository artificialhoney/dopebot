var EventEmitter = require('events').EventEmitter
var util = require('util')
var Entities = require('html-entities').AllHtmlEntities
var entities = new Entities()
var Yargs = require('yargs/yargs')
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS
var RTM_EVENTS = require('@slack/client').RTM_EVENTS

'use strict'

module.exports = {
  DopeBot: DopeBot
}

function DopeBot (logger, slack, mopidy, spotify, settings) {
  this.logger = logger
  this.slack = slack
  this.mopidy = mopidy
  this.spotify = spotify
  this.settings = settings
  this.channels = {}
  this.params = this.settings.params
  this.attachments = this.settings.attachments
  this.state = {}

  this.search = {results: {}, hits: 0}

  this.commands = []

  this.yargs = new Yargs()
    .usage('Usage: <command> [options]')
    .commandDir('commands', {
      visit: function (command) {
        this.commands.push(command)
        return command
      }.bind(this)
    })
    .help('help')
    .alias('help', 'h')
    .locale('en')
}

util.inherits(DopeBot, EventEmitter)

DopeBot.prototype.post = function (message, params) {
  params = params || this.params
  if (Array.isArray(message)) {
    params = Object.assign({attachments: message}, params)
    message = null
  } else {
    message = entities.decode(message)
  }
  this.slack.web.chat.postMessage(this.channel.id, message, params)
}

DopeBot.prototype.run = function () {
  this.logger.info('Starting dopebot', this.settings)
  this._init()
  this.mopidy.connect()
  this.slack.rtm.start()
}

DopeBot.prototype.getState = function (full) {
  var self = this

  if (full) {
    this.mopidy.playback.getState()
    .done(function (state) {
      self.state.state = state
    })
    this.mopidy.playback.getCurrentTlTrack()
    .done(function (tlTrack) {
      self.state.tlTrack = tlTrack
    })
    this.mopidy.mixer.getVolume()
    .done(function (volume) {
      self.state.volume = volume
    })
  }

  this.mopidy.tracklist.getConsume()
  .done(function (value) {
    self.state.consume = value
  })
  this.mopidy.tracklist.getRandom()
  .done(function (value) {
    self.state.random = value
  })
  this.mopidy.tracklist.getRepeat()
  .done(function (value) {
    self.state.repeat = value
  })
  this.mopidy.tracklist.getSingle()
  .done(function (value) {
    self.state.single = value
  })
}

DopeBot.prototype.updateHistoryState = function () {
  if (!this.state.tlTrack) {
    return
  }
  this.state.history = this.getHistoryState(this.state.tlTrack.tlid)
}

DopeBot.prototype.getUserById = function (id) {
  for (var u in this.info.users) {
    if (this.info.users[u].id === id) {
      return this.info.users[u]
    }
  }
  return null
}

DopeBot.prototype.getHistoryState = function (tlid) {
  for (var user in this.history) {
    var tlTrack = this.history[user].tracks[tlid]
    if (tlTrack) {
      return {
        user: this.getUserById(user)
      }
    }
  }
  return null
}

DopeBot.prototype._init = function () {
  var self = this

  if (this.settings.history === true) {
    this.history = {}

    this.on('tracklist:add', function (message, tlTracks) {
      if (!self.history[message.user]) {
        self.history[message.user] = {
          tracks: {}
        }
      }

      for (var i in tlTracks) {
        var tlTrack = tlTracks[i]
        self.history[message.user].tracks[tlTrack.tlid] = {
          track: tlTrack,
          timestamp: Date.now()
        }
      }
    })

    this.on('tracklist:clear', function () {
      self.history = {}
    })
  }

  this.mopidy.on('state:online', function () {
    self.logger.info('Connected to Mopidy')
  })

  this.slack.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    self.info = rtmStartData
    self.baseRegEx = self.settings.dialog === true ? new RegExp('^@' + self.info.self.id + ':?[ ]+(.*)', 'g') : /^(.*)/g
    self.channel = self.info.channels.find(function (channel) {
      return channel.name === self.settings.channel
    })
    self.logger.info('Connected to Slack. I am %s', self.info.self.id)
    self.post('Hi there, I\'m your DJ tonite! :notes: What can I do you for?')

    self.getState(true)
  })

  this.mopidy.on('event:trackPlaybackStarted', function (event) {
    self.logger.info('Track playback started: ' + event.tl_track.track.name)
    self.state.tlTrack = event.tl_track
    if (self.settings.history === true) {
      self.updateHistoryState()
    }
    self.post(self.attachments.state(self.state))
  })

  this.mopidy.on('event:volumeChanged', function (event) {
    self.logger.info('Volume changed')
    self.state.volume = event.volume
  })

  this.mopidy.on('event:playbackStateChanged', function (event) {
    self.logger.info('Playback state changed')
    self.state.state = event.new_state
  })

  this.mopidy.on('event:optionsChanged', function () {
    self.logger.info('Playback options changed')
    self.getState()
  })

  this.slack.rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    self.logger.debug('Received message', message)

    if (self.channel.id !== message.channel || message.type !== 'message' || !message.text || message.username === self.params.username) {
      return
    }

    // remove slack URL formatting
    message.text = message.text.replace(/[<>]/g, '').trim()

    var matches = message.text.match(self.baseRegEx)

    if (matches) {
      message.text = matches[0]
    } else {
      return
    }

    self.yargs.parse(message.text, {
      db: self,
      message: message
    }, function (exitError, parsed, output) {
      if (parsed.help) {
        var commands
        if (parsed._.length > 0) {
          const identifier = parsed._[0]
          commands = self.commands.filter(command => {
            if (command.command.split(' ')[0] === identifier) {
              return true
            }
            return command.aliases ? command.aliases.some(alias => alias === identifier) : false
          })
        } else {
          commands = self.commands
        }
        self.post(self.attachments.help(commands.length === 0 ? self.commands : commands))
      }
    })
  })
}

