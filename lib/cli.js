var program = require('commander')
var RtmClient = require('@slack/client').RtmClient
var WebClient = require('@slack/client').WebClient
var Mopidy = require('mopidy')
var SpotifyWebApi = require('spotify-web-api-node')
var winston = require('winston')
var commands = require('./commands')
var version = require('./version')
var DopeBot = require('./dopebot').DopeBot

'use strict'

module.exports = function () {
  program
    .version(version)
    .option('-t, --token [token]', 'Set [token] for the Slack API')
    .option('-m, --mopidy [url]', 'Set [url] for the Mopidy API', 'ws://localhost:6680/mopidy/ws')
    .option('-d, --dialog', 'Only respond to <@dopebot>')
    .option('-h, --history', 'Keep user commands in memory')
    .option('-u, --unfurl', 'Unfold Spotify URIs in Slack')
    .option('-e, --emoji [emoji]', 'Dopebot emoji icon in Slack', ':loud_sound:')
    .option('-l, --limit [limit]', 'Set [limit] for Spotify API result lists', 20)
    .option('-v, --verbose', 'Increase verbosity')
    .parse(process.argv)

  // init logger, according to program args
  var logger = new (winston.Logger)()

  logger.add(winston.transports.Console, {
    level: program.verbose === true ? 'debug' : 'info',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
  })

  var slack = {
    rtm: new RtmClient(program.token, {
      logger: logger.log.bind(logger)
    }),
    web: new WebClient(program.token, {
      logger: logger.log.bind(logger)
    })
  }

  var mopidy = new Mopidy({
    webSocketUrl: program.mopidy,
    console: logger,
    autoConnect: false,
    callingConvention: 'by-position-only'
  })

  var spotifyApi = new SpotifyWebApi()

  var db = new DopeBot(logger, slack, mopidy, spotifyApi, {
    dialog: program.dialog === true,
    history: program.history === true,
    limit: parseInt(program.limit),
    params: {
      username: 'dopebot',
      icon_emoji: program.emoji,
      unfurl_links: program.unfurl === true,
      unfurl_media: program.unfurl === true
    }
  })

  for (var i in commands) {
    db.command(commands[i])
  }

  db.run()
}
