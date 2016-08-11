var program = require('commander');
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var winston = require('winston');
var version = require('./version');

'use strict';

module.exports = function() {

  program
    .version(version)
    .option('-t, --token [token]', 'Set [token] for the Slack API')
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

  var rtm = new RtmClient(program.token, {logLevel: program.verbose ? 'debug' : 'info'});
  rtm.start();

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    logger.info('Connected to Slack', rtmStartData.self);
  });

  rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    logger.info('Received message', message);
  });
}
