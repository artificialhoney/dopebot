var EventEmitter = require('events').EventEmitter;
var util = require('util');
var extend = util._extend;
var Emitter = require('pattern-emitter');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var moment = require('moment');
var fs = require('fs');
var path = require('path');
var templates = require('./hbs');
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;

'use strict';

module.exports = {
  DopeBot: DopeBot
}

function DopeBot(logger, slack, mopidy, spotify, settings) {
  this.logger = logger;
  this.slack = slack;
  this.mopidy = mopidy;
  this.spotify = spotify;
  this.settings = settings;
  this.emitter = new Emitter();
  this.commands = [];
  this.channels = {};
  this.params = this.settings.params;
  this.state = {};
}

util.inherits(DopeBot, EventEmitter);

DopeBot.prototype.command = function(cmd) {
  this.commands.push(cmd);
  return this;
}

DopeBot.prototype.post = function(channel, message) {
  this.slack.web.chat.postMessage(channel, entities.decode(message), this.params);
}

DopeBot.prototype.broadcast = function(message) {
  for(var id in this.channels) {
    this.post(id, message);
  }
}


DopeBot.prototype.run = function() {
  this.logger.info('Starting dopebot', this.settings);
  this._init();
	this.mopidy.connect();
  this.slack.rtm.start();
}

DopeBot.prototype.getState = function(full) {
  var self = this;

  if (full) {
    this.mopidy.playback.getState()
    .done(function(state) {
      self.state.state = state;
    });
    this.mopidy.playback.getCurrentTlTrack()
    .done(function(tlTrack) {
      self.state.tlTrack = tlTrack;
    });
    this.mopidy.mixer.getVolume()
    .done(function(volume) {
      self.state.volume = volume;
    })
  }

  this.mopidy.tracklist.getConsume()
  .done(function(value) {
    self.state.consume = value;
  });
  this.mopidy.tracklist.getRandom()
  .done(function(value) {
    self.state.random = value;
  });  
  this.mopidy.tracklist.getRepeat()
  .done(function(value) {
    self.state.repeat = value;
  });
  this.mopidy.tracklist.getSingle()
  .done(function(value) {
    self.state.single = value;
  });
}

DopeBot.prototype.updateHistoryState = function() {
  if(!this.state.tlTrack) {
    return;
  }
  this.state.history = this.getHistoryState(this.state.tlTrack.tlid);
}

DopeBot.prototype.getUserById = function(id) {
  for(var u in this.info.users) {
    if (this.info.users[u].id === id) {
      return this.info.users[u];
    } 
  }
  return null;
}

DopeBot.prototype.getHistoryState = function(tlid) {
  for (var user in this.history) {
    var tlTrack = this.history[user].tracks[tlid]
    if (tlTrack) {
      return {
        user: this.getUserById(user),
        timestamp: moment(tlTrack.timestamp).fromNow()
      };
    }
  }
  return null;
}

DopeBot.prototype.emitCommand = function(command, message) {
  if (this.settings.dialog === true) {
    command = '@' + this.info.self.id + ': ' + command;
  }
  this.emitter.emit(command, message, this);
}

DopeBot.prototype._init = function() {

  var self = this;

  if (this.settings.history === true) {

    this.history = {};

    this.on('tracklist:add', function(message, tlTracks) {
      if (!self.history[message.user]) {
        self.history[message.user] = {
          tracks: {}
        }
      }

      for(var i in tlTracks) {
        tlTrack = tlTracks[i];
        self.history[message.user].tracks[tlTrack.tlid] =  {
          track: tlTrack,
          timestamp: Date.now()
        }
      }
    });

    this.on('tracklist:clear', function() {
      self.history = {};
    });
  }

  this.mopidy.on("state:online", function () {
    self.logger.info('Connected to Mopidy');
  });

  this.slack.rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    self.info = rtmStartData;
    self.baseRegEx = self.settings.dialog === true ? new RegExp('^@' + self.info.self.id + ':?[ ]+') : /^/;
    self.logger.info('Connected to Slack. I am %s', self.info.self.id);

    self.emitter.on(/.*/, function(message) {
      if (message && message.channel) {
        for(var i in self.info.channels) {
          if (self.info.channels[i].id === message.channel) {
            self.channels[self.info.channels[i].id] = self.info.channels[i];
          }
        }
      }
    });

    self.command({regEx: /(state|status)/, help: 'Gets the current playback state', execute: function(message) {
      if (self.settings.history === true) {
        self.updateHistoryState();
      }
      self.post(message.channel, templates.state({state: self.state}));
    }});

    self.command({regEx: /help/, help: 'Prints out this message', execute: function(message) {
      self.post(message.channel, templates.help({commands: self.commands}));
    }});

    for(var i in self.commands) {
      var cmd = self.commands[i];
      self.emitter.on(new RegExp(self.baseRegEx.source + cmd.regEx.source + /$/.source), cmd.execute.bind(cmd));
    }

    self.getState(true);

  });

  this.mopidy.on('event:trackPlaybackStarted', function (event) {
    self.logger.info('Track playback started');
    self.state.tlTrack = event.tl_track;
    if (self.settings.history === true) {
      self.updateHistoryState();
    }
    self.broadcast(templates.state({state: self.state}));
  });

  this.mopidy.on('event:volumeChanged', function (event) {
    self.logger.info('Volume changed');
    self.state.volume = event.volume;
  });

  this.mopidy.on('event:playbackStateChanged', function(event) {
    self.logger.info('Playback state changed');
    self.state.state = event.new_state;
  });

  this.mopidy.on('event:optionsChanged', function() {
    self.logger.info('Playback options changed');
    self.getState();
  });

  this.slack.rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    self.logger.debug('Received message', message);
    if(message.type === 'message' && message.text) {
      // remove slack URL formatting
      message.text = message.text.replace(/[<>]/g, '');
      self.emitter.emit(message.text, message, self);
    }
  });

  
}

