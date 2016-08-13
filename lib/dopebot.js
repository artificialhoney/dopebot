var Emitter = require('pattern-emitter');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var fs = require('fs');
var path = require('path');
var templates = require('./hbs');

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
}

DopeBot.prototype.command = function(cmd) {
  this.commands.push(cmd);
  return this;
}

DopeBot.prototype.post = function(channel, message) {
  this.slack.postMessageToChannel(this.channels[channel].name, entities.decode(message), this.params);
}

DopeBot.prototype.run = function() {
  this._init();
	this.mopidy.connect();
}


DopeBot.prototype._init = function() {

  var self = this;

  this.mopidy.on("state:online", function () {
    self.logger.info('Connected to Mopidy');
  });

  this.slack.on('start', function () {
    self.info = this;
    self.baseRegEx = self.settings.dialog === true ? new RegExp('<@' + self.info.self.id + '>[ ]+') : /^/;
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

    self.command({regEx: /help/, help: 'Prints out this message', execute: function(message, db) {
      db.post(message.channel, templates.help({commands: db.commands}));
    }});


    for(var i in self.commands) {
      var cmd = self.commands[i];
      self.emitter.on(new RegExp(self.baseRegEx.source + cmd.regEx.source + /$/.source), cmd.execute.bind(cmd));
    }

  });

  this.mopidy.on('event:trackPlaybackStarted', function (event) {
    self.logger.info('Track playback started');
    
    for(var i in self.channels) {
      self.post(self.channels[i].id, templates.current({track: event.tl_track.track}));
    }
  });

  this.slack.on('message', function (message) {
    self.logger.debug('Received message', message);
    if(message.type === 'message') {
      // remove slack URL formatting
      message.text = message.text.replace(/[<>]/g, '');
      self.emitter.emit(message.text, message, self);
    }
  });

  
}

