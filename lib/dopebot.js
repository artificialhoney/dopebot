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
	this.mopidy.connect();
}

DopeBot.prototype._init = function() {

  var self = this;

  self.mopidy.on("state:online", function () {
    self.logger.info('Connected to Mopidy');
  });

  this.slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    self.bot = rtmStartData.self;
    self.logger.info('Connected to Slack. I am %s', rtmStartData.self.id);
  });

  this.slack.on(RTM_EVENTS.MESSAGE, function (message) {
    self.logger.debug('Received message', message);

    var text = message.text || '';
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
  var playRegEx = /(play|queue)[ ]+(album|artist|playlist|track)[ ]+(\d{1,3})/;
  self.emitter.on(playRegEx, function(message) {
    var matches = message.text.match(playRegEx);
    var cmd = matches[1];
    var type = matches[2] + 's';
    var id = parseInt(matches[3]);

    if (!self.lastSearchResults || !self.lastSearchResults[type] || !self.lastSearchResults[type].items[id]) {
      self.slack.sendMessage(playTemplate(), message.channel);
      return;
    }

    if (cmd === 'play') {
      self.logger.info('Clearing tracklist');
      self.mopidy.tracklist.clear();
    }

    var item = self.lastSearchResults[type].items[id];
    self.logger.info('Adding %s to tracklist', item.external_urls.spotify);
    self.mopidy.tracklist.add(null,null,item.uri)
    .done(function(tracks) {
      self.mopidy.playback.play();
      self.slack.sendMessage(playTemplate({item: item}), message.channel);
    });

  });

  var playSpotifyTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/play_spotify.hbs'), 'utf8'));
  var playSpotifyEx = /(play|queue)[ ]+<(spotify:[\w:]+[a-zA-Z0-9]{22})>/;
  self.emitter.on(playSpotifyEx, function(message) {
    var matches = message.text.match(playSpotifyEx);
    var cmd = matches[1];
    var uri = matches[2];

    if (cmd === 'play') {
      self.logger.info('Clearing tracklist');
      self.mopidy.tracklist.clear();
    }

    self.logger.info('Adding %s to tracklist', uri);
    self.mopidy.tracklist.add(null,null,uri)
    .done(function(tracks) {
      self.mopidy.playback.play();
      self.slack.sendMessage(playSpotifyTemplate({uri: uri}), message.channel);
    });

  });

  var currentTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/current.hbs'), 'utf8'));
  var currentRegEx = /(current)/;
  self.emitter.on(currentRegEx, function(message) {
    self.logger.info('Getting current track');
    self.mopidy.playback.getCurrentTrack()
    .done(function(track) {
      self.slack.sendMessage(currentTemplate({track: track}), message.channel);
    });
  });

  var tracksTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/tracks.hbs'), 'utf8'));
  var tracksRegEx = /(tracks|tracklist)/;
  self.emitter.on(tracksRegEx, function(message) {
    self.logger.info('Getting current tracklist');
    self.mopidy.tracklist.getTracks()
    .done(function(tracks) {
      self.slack.sendMessage(tracksTemplate({tracks: tracks}), message.channel);
    });
  });

  var nextRegEx = /(next|skip)/;
  self.emitter.on(nextRegEx, function(message) {
    self.logger.info('Playing next track');
    self.mopidy.playback.next();
    // too fast, maybe with timeout, otherwise it shows the old track
    //self.emitter.emit('current',message);
  });

  var prevRegEx = /(prev|previous|back)/;
  self.emitter.on(prevRegEx, function(message) {
    self.logger.info('Playing previous track');
    self.mopidy.playback.previous();
    // not working, s.a.
    //.done(function() {
      //self.emitter.emit('current', message);
    //});
  });

  var pauseRegEx = /(pause)/;
  self.emitter.on(pauseRegEx, function(message) {
    self.logger.info('Pause current track');
    self.mopidy.playback.pause()
    .done(function() {
      self.emitter.emit('state', message);
    });
  });

  var resumeRegEx = /(resume)/;
  self.emitter.on(resumeRegEx, function(message) {
    self.logger.info('Resume current track');
    self.mopidy.playback.resume()
    .done(function() {
      self.emitter.emit('state', message);
    });
  });

  var stopRegEx = /(stop)/;
  self.emitter.on(stopRegEx, function(message) {
    self.logger.info('Stop playback');
    self.mopidy.playback.stop()
    .done(function() {
      self.emitter.emit('state', message);
    });
  });

  var volumeTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/volume.hbs'), 'utf8'));
  var volumeRegEx = /(?:vol|volume)[ ]*(\d{1,3})?/;
  self.emitter.on(volumeRegEx, function(message) {
    var matches = message.text.match(volumeRegEx);

    if(matches[1] !== undefined) {
      self.logger.info('Setting volume to %d', matches[1]);
      self.mopidy.mixer.setVolume(parseInt(matches[1]))
      .done(function(volume) {
        // don not create endless loops
        message.text = 'volume';
        self.emitter.emit('volume', message);
      });
    } else {
      self.logger.info('Getting volume');
      self.mopidy.mixer.getVolume()
      .done(function(volume) {
        self.slack.sendMessage(volumeTemplate({volume: volume}), message.channel);
      });
    }
  });

  var stateTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/state.hbs'), 'utf8'));
  var stateRegEx = /(state|status)/;
  self.emitter.on(stateRegEx, function(message) {
    self.logger.info('Getting playback state');
    self.mopidy.playback.getState()
    .done(function(state) {
      self.slack.sendMessage(stateTemplate({state: state}), message.channel);
    });
  });

  var helpTemplate = handlebars.compile(fs.readFileSync(path.join(__dirname, 'hbs/help.hbs'), 'utf8'));
  self.emitter.on(/help/, function(message) {
    self.slack.sendMessage(helpTemplate({
      commands: {
        'search <types...> <query>': {
          label: 'Search Spotify',
          description: '<types> can contain "album, artist, playlist or track"',
          example: 'search album,track Beatles'
        },
        'play <type> <index>': {
          label: 'Play Spotify-URI from search',
          description: 'This commands refers to the run search before',
          example: 'play album 5'
        },
        'queue <type> <index>': {
          label: 'Enqueue Spotify-URI from search',
          description: 'This commands refers to the run search before',
          example: 'queue album 5'
        },
        'play <spotify_uri>': {
          label: 'Play Spotify-URI',
          description: '<spotify_uri> can be obtained from a Spotify client app',
          example: 'play <spotify_uri>'
        },
        'queue <spotify_uri>': {
          label: 'Enqueue Spotify-URI',
          description: '<spotify_uri> can be obtained from a Spotify client app',
          example: 'queue <spotify_uri>'
        },
        'current': {
          label: 'Get current track from Mopidy'
        },
        'tracks': {
          label: 'Get current tracklist from Mopidy'
        },
        'next': {
          label: 'Play next track from tracklist'
        },
        'previous': {
          label: 'Play previous track from tracklist'
        },
        'pause': {
          label: 'Pause current track'
        },
        'resume': {
          label: 'Resume current track'
        },
        'stop': {
          label: 'Stop playback'
        },
        'volume <0-100>': {
          label: 'Get/Set Volume',
          description: 'Without volume percentage, the volume is read from Mopidy',
          example: 'volume 55'
        },
        'state': {
          label: 'Get playback state'
        }
      }
    }), message.channel);
  });
}

