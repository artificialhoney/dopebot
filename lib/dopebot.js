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
    if (self.settings.dialog === true && !text.includes('<@' + self.bot.id + '>')) {
      return;
    }

    self.emitter.emit(text, message);
  });

  var searchTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/search.hbs'), 'utf8'));
  var searchRegEx = /search[ ]*([ ,]+(?:album|artist|playlist|track))*[ ]+(.*)/;
  self.emitter.on(searchRegEx, function(message) {
    var typesStr = message.text.match(searchRegEx)[1] || '';
    var types = [];
    if (typesStr.includes('album')) types.push('album');
    if (typesStr.includes('artist')) types.push('artist');
    if (typesStr.includes('playlist')) types.push('playlist');
    if (typesStr.includes('track')) types.push('track');

    if (types.length == 0) types = ['album', 'artist', 'playlist', 'track'];

    var query = message.text.match(searchRegEx)[2];
    self.logger.debug('Searching for "%s" in [%s]', query, types.join(', '));

    self.spotify.search(query, types)
    .then(function(data) {
      self.slack.sendMessage(searchTemplate({response: data.body}), message.channel);
    }, function(err) {
      self.logger.error(err);
    });
  });
}

