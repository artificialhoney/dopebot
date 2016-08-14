var templates = require('./hbs');
var lastSearchResults = {};

module.exports = [
  {
    regEx: /search (album|artist|playlist|track)?(.*)/,
    help: 'Searches Spotify for the given query',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var query = matches[2];
      var types = [];
      if (matches[1]) {
        types.push(matches[1])
      } else {
        types = types.concat(['album', 'artist', 'playlist', 'track'])
      }

      db.logger.info('Searching for "%s" in [%s]', query, types.join(', '));

      db.spotify.search(query, types, {
        limit: db.settings.limit,
        offset: 0
      })
      .then(function(data) {
        //db.logger.debug(data);
        db.post(message.channel, templates.search({response: lastSearchResults = data.body}));
      }, function(err) {
        db.logger.error(err);
      });
    }
  },
  {
    regEx: /play (album|artist|playlist|track) (\d+)/,
    help: 'Plays a Spotify resource from the last search',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var type = matches[1] + 's';
      var id = parseInt(matches[2]);

      if (!lastSearchResults || !lastSearchResults[type] || !lastSearchResults[type].items[id]) {
        db.post(message.channel, templates.play());
        return;
      }

      db.logger.info('Clearing tracklist');
      db.mopidy.tracklist.clear()
      .done(function() {
        var item = lastSearchResults[type].items[id];
        db.logger.info('Adding %s to tracklist', item.uri);
        db.mopidy.tracklist.add(null,null,item.uri)
        .done(function(tracks) {
          db.mopidy.playback.play();
          db.post(message.channel, templates.play({item: item}));
        });
      });
    }
  },
  {
    regEx: /queue (album|artist|playlist|track) (\d+)/,
    help: 'Enqueues a Spotify resource from the last search',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var type = matches[1] + 's';
      var id = parseInt(matches[2]);

      if (!lastSearchResults || !lastSearchResults[type] || !lastSearchResults[type].items[id]) {
        db.post(message.channel, templates.play());
        return;
      }

      var item = lastSearchResults[type].items[id];
      db.logger.info('Adding %s to tracklist', item.uri);
      db.mopidy.tracklist.add(null,null,item.uri)
      .done(function(tracks) {
        db.post(message.channel, templates.play({item: item}));
      });
    }
  },
  {
    regEx: /play (spotify:[\w:]+[a-zA-Z0-9]{22})/,
    help: 'Plays a Spotify URI',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var uri = matches[1];
      db.logger.info('Clearing tracklist');
      db.mopidy.tracklist.clear()
      .done(function() {
        db.logger.info('Adding %s to tracklist', uri);
        db.mopidy.tracklist.add(null,null,uri)
        .done(function(tracks) {
          db.mopidy.playback.play();
          db.post(message.channel, templates.play_spotify({uri: uri}));
        });
      });
    }
  },
  {
    regEx: /queue (spotify:[\w:]+[a-zA-Z0-9]{22})/,
    help: 'Enqueues a Spotify URI',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var uri = matches[1];
      db.logger.info('Adding %s to tracklist', uri);
      db.mopidy.tracklist.add(null,null,uri)
      .done(function(tracks) {
        db.post(message.channel, templates.play_spotify({uri: uri}));
      });
    }
  },
  {
    regEx: /tracks/,
    help: 'Prints out the current tracklist',
    execute: function(message, db) {
      db.logger.info('Getting current tracklist');
      db.mopidy.tracklist.index()
      .done(function(index) {
        if(!index) {
          return;
        }
        db.mopidy.tracklist.slice(index, index+10)
        .done(function(tlTracks) {
          tlTracks = tlTracks.map(function(currentValue, i){
            currentValue.index = index + i;
            return currentValue;
          });
          db.post(message.channel, templates.tracks({tlTracks: tlTracks}));
        });
      });
    }
  },
  {
    regEx: /clear/,
    help: 'Clears the tracklist',
    execute: function(message, db) {
      db.logger.info('Clearing current tracklist');
      db.mopidy.tracklist.clear();
    }
  },
  {
    regEx: /next/,
    help: 'Plays the next track from the tracklist',
    execute: function(message, db) {
      db.logger.info('Playing next track');
      db.mopidy.playback.next();
    }
  },
  {
    regEx: /prev/,
    help: 'Plays the previous track from the tracklist',
    execute: function(message, db) {
      db.logger.info('Playing previous track');
      db.mopidy.playback.previous();
    }
  },
  {
    regEx: /pause/,
    help: 'Pauses the current tracks',
    execute: function(message, db) {
      db.logger.info('Pausing current track');
      db.mopidy.playback.pause()
      .done(function() {
        db.emitter.emit('state', message, db);
      });
    }
  },
  {
    regEx: /resume/,
    help: 'Resumes the current tracks',
    execute: function(message, db) {
      db.logger.info('Resuming current track');
      db.mopidy.playback.resume()
      .done(function() {
        db.emitter.emit('state', message, db);
      });
    }
  },
  {
    regEx: /stop/,
    help: 'Stops playback',
    execute: function(message, db) {
      db.logger.info('Stopping playback');
      db.mopidy.playback.stop()
      .done(function() {
        db.emitter.emit('state', message, db);
      });
    }
  },
  {
    regEx: /play/,
    help: 'Plays current tracklist',
    execute: function(message, db) {
      db.logger.info('Playing tracklist');
      db.mopidy.playback.play()
      .done(function() {
        db.emitter.emit('state', message, db);
      });
    }
  },
  {
    regEx: /mode (consume|random|repeat|single)/,
    help: 'Gets a specific mode enabled state',
    execute: function(message, db) {
      var mode = message.text.match(this.regEx)[1];
      db.logger.info('Getting %s mode', mode);
      mode = mode.charAt(0).toUpperCase() + mode.slice(1);
      db.mopidy.tracklist['get' + mode]()
      .done(function(value) {
        db.post(message.channel, templates.mode({mode: mode, value: value}));
      });
    }
  },
  {
    regEx: /mode (consume|random|repeat|single) (true|false)/,
    help: 'Sets a specific mode enabled state',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      var mode = matches[1];
      var value = matches[2];
      db.logger.info('Setting %s mode to %s', mode, value);
      mode = mode.charAt(0).toUpperCase() + mode.slice(1);
      db.mopidy.tracklist['set' + mode](value === 'true')
      .done(function() {
        db.emitter.emit('mode ' + mode.toLowerCase(), message, db);
      });
    }
  },
  {
    regEx: /vol/,
    help: 'Gets the volume',
    execute: function(message, db) {
      db.logger.info('Getting volume');
      db.mopidy.mixer.getVolume()
      .done(function(volume) {
        db.post(message.channel, templates.volume({volume: volume}));
      });
    }
  },
  {
    regEx: /vol (\d{1,3})/,
    help: 'Sets the volume',
    execute: function(message, db) {
      var matches = message.text.match(this.regEx);
      db.logger.info('Setting volume to %d', matches[1]);
      db.mopidy.mixer.setVolume(parseInt(matches[1]))
      .done(function(volume) {
        db.emitter.emit('vol', message, db);
      });
    }
  }
]