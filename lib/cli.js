const RtmClient = require('@slack/client').RTMClient
const WebClient = require('@slack/client').WebClient
const Mopidy = require('mopidy')
const SpotifyWebApi = require('spotify-web-api-node')
const { createLogger, format, transports, config } = require('winston')
const { combine, timestamp, colorize, printf, splat } = format
const attachments = require('./attachments')
const DopeBot = require('./dopebot').DopeBot
const yargs = require('yargs')

module.exports = function () {
  const argv = yargs
    .usage('Usage: dopebot [options]')
    .option('token', {
      alias: 'T',
      demand: true,
      type: 'string',
      describe: 'Set token for the Slack API'
    })
    .option('bot-token', {
      alias: 'B',
      demand: true,
      type: 'string',
      describe: 'Set bot token for the Slack API'
    })
    .option('channel', {
      alias: 'C',
      demand: true,
      type: 'string',
      describe: 'Set the Slack channel Id to listen for input'
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
    .option('id', {
      alias: 'I',
      demand: true,
      type: 'string',
      describe: 'Set the Spotify client Id'
    })
    .option('secret', {
      alias: 'S',
      demand: true,
      type: 'string',
      describe: 'Set the Spotify client secret'
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

  const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`
  })

  const logger = createLogger({
    level: Object.keys(config.npm.levels).find(function (level) {
      return config.npm.levels[level] === Math.min(argv.verbose + 2, Object.keys(config.npm.levels).length - 1)
    }),
    format: combine(
      timestamp(),
      colorize(),
      splat(),
      myFormat
    ),
    transports: [
      new (transports.Console)()
    ],
    exitOnError: false // do not exit on handled exceptions
  })

  const loggerFacade = {
    debug: (...msg) => {
      logger.debug(...msg)
    },
    info: (...msg) => {
      logger.info(...msg)
    },
    warn: (...msg) => {
      logger.warn(...msg)
    },
    error: (...msg) => {
      logger.error(...msg)
    },
    setLevel: () => {},
    setName: () => {}
  }

  const slack = {
    rtm: new RtmClient(argv['bot-token'], {
      logger: loggerFacade
    }),
    web: new WebClient(argv.token, {
      logger: loggerFacade
    })
  }

  const mopidy = new Mopidy({
    webSocketUrl: argv.mopidy,
    console: logger,
    autoConnect: false,
    callingConvention: 'by-position-only'
  })

  const spotifyApi = new SpotifyWebApi({
    clientId: argv.id,
    clientSecret: argv.secret
  })

  const db = new DopeBot(logger, slack, mopidy, spotifyApi, {
    channel: argv.channel,
    dialog: argv.dialog === true,
    history: argv.brain === true,
    limit: parseInt(argv.limit),
    attachments: attachments({
      color: '#ff9800',
      formatTrack: function (track) {
        return {
          track: `<${track.uri}|${track.name}>`,
          artists: track.artists.map(artist => `<${artist.uri}|${artist.name}>`).join(', '),
          album: `<${track.album.uri}|${track.album.name}>`
        }
      }
    }),
    params: {
      username: 'dopebot',
      icon_emoji: argv.emoji,
      unfurl_links: argv.unfurl === true,
      unfurl_media: argv.unfurl === true
    }
  })

  db.run()
}
