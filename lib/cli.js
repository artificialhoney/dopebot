var program = require('commander');
var RtmClient = require('@slack/client').RtmClient;
var Mopidy = require("mopidy");
var SpotifyWebApi = require('spotify-web-api-node');
var winston = require('winston');
var version = require('./version');
var DopeBot = require('./dopebot').DopeBot;

'use strict';

module.exports = function() {

  program
    .version(version)
    .option('-t, --token [token]', 'Set [token] for the Slack API')
    .option('-m, --mopidy [url]', 'Set [url] for the Mopidy API', 'ws://localhost:6680/mopidy/ws/')
    .option('-d, --dialog', 'Only respond to <@dopebot>', false)
    .option('-l, --limit [limit]', 'Set [limit] for Spotify API requests', 10)
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

  var rtm = new RtmClient(program.token, {
    logLevel: 'info',
    logger: function(logLevel, logString) {
      logger.log(logLevel, logString);
    }
  });
  rtm.start();

  var mopidy = new Mopidy({
    webSocketUrl: program.mopidy,
    console: logger,
    autoConnect: false,
    callingConvention: 'by-position-only'
  });

  var spotifyApi = new SpotifyWebApi();

  new DopeBot(logger, rtm, mopidy, spotifyApi, {
    dialog: program.dialog,
    limit: program.limit
  }).run();
}
