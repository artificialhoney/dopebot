const EventEmitter = require('events').EventEmitter
const util = require('util')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const Yargs = require('yargs/yargs')

module.exports = {
  DopeBot: DopeBot
}

function DopeBot (logger, slack, mopidy, spotify, settings) {
  this.logger = logger
  this.slack = slack
  this.mopidy = mopidy
  this.spotify = spotify
  this.settings = settings
  this.channel = this.settings.channel
  this.params = this.settings.params
  this.attachments = this.settings.attachments
  this.state = {}

  this.search = { results: {}, hits: 0 }

  this.commands = []

  this.yargs = new Yargs()
    .usage('Usage: <command> [options]')
    .commandDir('commands', {
      visit: (command) => {
        this.commands.push(command)
        return command
      }
    })
    .help('help')
    .alias('help', 'h')
    .locale('en')
}

util.inherits(DopeBot, EventEmitter)

DopeBot.prototype.post = function (message, params) {
  params = params || this.params
  if (Array.isArray(message)) {
    params = Object.assign({ attachments: message }, params)
    message = null
  } else {
    message = entities.decode(message)
  }

  params.channel = this.channel
  params.text = message
  this.slack.web.chat.postMessage(params)
}

DopeBot.prototype.run = function () {
  this.logger.info('Starting dopebot', this.settings)
  this._init()
  this.mopidy.connect()
  this.slack.rtm.start()
}

DopeBot.prototype.getState = function (full) {
  let self = this

  if (full) {
    this.mopidy.playback.getState()
      .then(function (state) {
        self.state.state = state
      })
    this.mopidy.playback.getCurrentTlTrack()
      .then(function (tlTrack) {
        self.state.tlTrack = tlTrack
      })
    this.mopidy.mixer.getVolume()
      .then(function (volume) {
        self.state.volume = volume
      })
  }

  this.mopidy.tracklist.getConsume()
    .then(function (value) {
      self.state.consume = value
    })
  this.mopidy.tracklist.getRandom()
    .then(function (value) {
      self.state.random = value
    })
  this.mopidy.tracklist.getRepeat()
    .then(function (value) {
      self.state.repeat = value
    })
  this.mopidy.tracklist.getSingle()
    .then(function (value) {
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
  for (let u in this.info.users) {
    if (this.info.users[u].id === id) {
      return this.info.users[u]
    }
  }
  return null
}

DopeBot.prototype.getHistoryState = function (tlid) {
  for (let user in this.history) {
    let tlTrack = this.history[user].tracks[tlid]
    if (tlTrack) {
      return {
        user: this.getUserById(user)
      }
    }
  }
  return null
}

DopeBot.prototype._init = function () {
  let self = this

  if (this.settings.history === true) {
    this.history = {}

    this.on('tracklist:add', function (message, tlTracks) {
      if (!self.history[message.user]) {
        self.history[message.user] = {
          tracks: {}
        }
      }

      for (let i in tlTracks) {
        let tlTrack = tlTracks[i]
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

  this.slack.rtm.on('authenticated', function (rtmStartData) {
    self.info = rtmStartData

    const param = {
      exclude_archived: true,
      types: 'public_channel,private_channel',
      limit: 1000
    };
    
    self.slack.web.conversations.list(param).then(res => {
      let rawchannel = res.channels.find(function (channel) {
        return channel.name === self.settings.channel || channel.id === self.settings.channel
      })

      self.channel = rawchannel.id;

      self.logger.info(`Connected to Slack channel: ${rawchannel.name} with id: ${rawchannel.id}`)
      self.baseRegEx = self.settings.dialog === true ? new RegExp('^@' + self.info.self.id + ':?[ ]+(.*)', 'g') : /^(.*)/g
      self.post('Hi there, I\'m your DJ tonite! :notes: What can I do you for?')
  
      self.getState(true)
    });
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

  this.slack.rtm.on('message', function (message) {
    self.logger.debug('Received message: %j', message)

    if (self.channel !== message.channel || message.type !== 'message' || !message.text || message.username === self.params.username) {
      return
    }

    // remove slack URL formatting
    message.text = message.text.replace(/[<>]/g, '').trim()

    let matches = message.text.match(self.baseRegEx)

    console.log(matches)

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
        let commands
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
