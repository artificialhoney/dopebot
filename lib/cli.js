var program = require('commander');
var SlackBot = require('slackbots');
var Mopidy = require("mopidy");
var SpotifyWebApi = require('spotify-web-api-node');
var winston = require('winston');
var commands = require('./commands');
var version = require('./version');
var DopeBot = require('./dopebot').DopeBot;

'use strict';

module.exports = function() {

  program
    .version(version)
    .option('-t, --token [token]', 'Set [token] for the Slack API')
    .option('-m, --mopidy [url]', 'Set [url] for the Mopidy API', 'ws://localhost:6680/mopidy/ws')
    .option('-d, --dialog', 'Only respond to <@dopebot>', false)
    .option('-u, --unfurl', 'Unfold Spotify URIs in Slack', false)
    .option('-e, --emoji [emoji]', 'Dopebot emoji icon in Slack', ':loud_sound:')
    .option('-l, --limit [limit]', 'Set [limit] for Spotify API result lists', 4)
    .option('-v, --verbose', 'Increase verbosity')
    .parse(process.argv);

  // init logger, according to program args
  var logger = new (winston.Logger)();


  logger.add(winston.transports.Console, {
    level: program.verbose ? 'debug' : 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
  });

  var bot = new SlackBot({
    token: program.token,
    name: 'dopebot'
  });

  var mopidy = new Mopidy({
    webSocketUrl: program.mopidy,
    console: logger,
    autoConnect: false,
    callingConvention: 'by-position-only'
  });

  var spotifyApi = new SpotifyWebApi();

  var db = new DopeBot(logger, bot, mopidy, spotifyApi, {
    dialog: program.dialog,
    limit: program.limit,
    params: {
      icon_emoji: program.emoji,
      unfurl_links: program.unfurl,
      unfurl_media: program.unfurl
    }
  });

  for(var i in commands) {
    db.command(commands[i]);
  }

  db.run();
}
