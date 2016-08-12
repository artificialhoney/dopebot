var Emitter = require('pattern-emitter');
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var handlebars = require('handlebars');
var fs = require('fs');
var path = require('path');

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

  this._init();
}

DopeBot.prototype.run = function() {
	this.slack.start();
	//this.mopidy.connect();
}

DopeBot.prototype._init = function() {

  var self = this;

  this.slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    self.bot = rtmStartData.self;
    self.logger.info('Connected to Slack. I am %s', rtmStartData.self.id);
  });

  this.slack.on(RTM_EVENTS.MESSAGE, function (message) {
    self.logger.debug('Received message', message);

    var text = message.text;
    if (self.settings.dialog === true && text.indexOf('<@' + self.bot.id + '>') === -1) {
      return;
    }

    self.emitter.emit(text, message);
  });

  var searchTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/search.hbs'), 'utf8'));
  var searchRegEx = /search[ ]*([ ,]+(?:album|artist|playlist|track))*[ ]+(.*)/;
  self.emitter.on(searchRegEx, function(message) {
    var matches = message.text.match(searchRegEx);
    var typesStr = matches[1] || '';
    var types = [];
    if (typesStr.indexOf('album') !== -1) types.push('album');
    if (typesStr.indexOf('artist') !== -1) types.push('artist');
    if (typesStr.indexOf('playlist') !== -1) types.push('playlist');
    if (typesStr.indexOf('track') !== -1) types.push('track');

    if (types.length == 0) types = ['album', 'artist', 'playlist', 'track'];

    var query = matches[2];
    self.logger.info('Searching for "%s" in [%s]', query, types.join(', '));

    self.spotify.search(query, types, {
      limit: self.settings.limit,
      offset: 0
    })
    .then(function(data) {
      self.slack.sendMessage(searchTemplate({response: self.lastSearchResults = data.body}), message.channel);
    }, function(err) {
      self.logger.error(err);
    });
  });

  var playTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/play.hbs'), 'utf8'));
  var playRegEx = /play[ ]+(album|artist|playlist|track)[ ]+(.*)/;
  self.emitter.on(searchRegEx, function(message) {

  });
}

