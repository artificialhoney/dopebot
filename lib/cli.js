var RtmClient = require('@slack/client').RtmClient
var WebClient = require('@slack/client').WebClient
var Mopidy = require('mopidy')
var SpotifyWebApi = require('spotify-web-api-node')
var winston = require('winston')
var DopeBot = require('./dopebot').DopeBot
var yargs = require('yargs')

'use strict'

module.exports = function () {
  var argv = yargs
    .usage('Usage: dopebot [options]')
    .option('token', {
      alias: 't',
      demand: true,
      type: 'string',
      describe: 'Set token for the Slack API'
    })
    .option('channel', {
      alias: 'c',
      demand: true,
      type: 'string',
      describe: 'Set the Slack channel name to listen for input'
    })
    .option('mopidy', {
      alias: 'm',
      type: 'string',
      describe: 'Set the WS-URL of Mopidy',
      default: 'ws://localhost:6680/mopidy/ws'
    })
    .option('mopidy', {
      alias: 'm',
      type: 'string',
      describe: 'Set the WS-URL of Mopidy',
      default: 'ws://localhost:6680/mopidy/ws'
    })
    .option('dialog', {
      alias: 'd',
      type: 'boolean',
      describe: 'Only respond to <@dopebot>',
      default: false
    })
    .option('brain', {
      alias: 'b',
      type: 'boolean',
      describe: 'Remember user commands',
      default: false
    })
    .option('unfurl', {
      alias: 'u',
      type: 'boolean',
      describe: 'Unfold Spotify URIs in Slack',
      default: false
    })
    .option('emoji', {
      alias: 'e',
      type: 'string',
      describe: 'Dopebot emoji icon in Slack',
      default: ':loud_sound:'
    })
    .option('limit', {
      alias: 'l',
      type: 'number',
      describe: 'Set limit for Spotify API result lists',
      default: 20
    })
    .option('verbose', {
      alias: 'v',
      type: 'count',
      describe: 'Increase verbosity'
    })
    .help('help')
    .alias('help', 'h')
    .locale('en')
    .argv

  if (argv.help) {
    // show help and exit
    yargs.showHelp()
  }

  var logger = new (winston.Logger)()

  logger.add(winston.transports.Console, {
    level: Object.keys(winston.config.npm.levels).find(function (level) {
      return winston.levels[level] === Math.min(argv.verbose + 2, Object.keys(winston.levels).length - 1)
    }),
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: true
  })

  var slack = {
    rtm: new RtmClient(argv.token, {
      logger: logger.log.bind(logger)
    }),
    web: new WebClient(argv.token, {
      logger: logger.log.bind(logger)
    })
  }

  var mopidy = new Mopidy({
    webSocketUrl: argv.mopidy,
    console: logger,
    autoConnect: false,
    callingConvention: 'by-position-only'
  })

  var spotifyApi = new SpotifyWebApi()

  var db = new DopeBot(logger, slack, mopidy, spotifyApi, {
    channel: argv.channel,
    dialog: argv.dialog === true,
    history: argv.history === true,
    limit: parseInt(argv.limit),
    params: {
      username: 'dopebot',
      icon_emoji: argv.emoji,
      unfurl_links: argv.unfurl === true,
      unfurl_media: argv.unfurl === true
    }
  })

  db.run()
}
