# dopebot

Slack bot which connects with Mopidy and Spotify.

## Installation

1. `npm install dopebot --global`

## Usage


`dopebot --token "<SLACK_TOKEN>" --bot-token "<SLACK_BOT_TOKEN>" --channel "<SLACK_CHANNEL_ID>" --id "<SPOTIFY_CLIENT_ID>" --secret "<SPOTIFY_CLIENT_SECRET>" --mopidy "<MOPIDY_URL>" --brain`

Please see `dopebot --help`:

```
Usage: dopebot [options]

Options:
  --version        Show version number                                 [boolean]
  --token, -T      Set token for the Slack API               [string] [required]
  --bot-token, -B  Set bot token for the Slack API           [string] [required]
  --channel, -C    Set the Slack channel Id to listen for input
                                                             [string] [required]
  --mopidy, -m     Set the WS-URL of Mopidy
                             [string] [default: "ws://localhost:6680/mopidy/ws"]
  --dialog, -d     Only respond to <@dopebot>         [boolean] [default: false]
  --brain, -b      Remember user commands             [boolean] [default: false]
  --unfurl, -u     Unfold Spotify URIs in Slack       [boolean] [default: false]
  --emoji, -e      Dopebot emoji icon in Slack[string] [default: ":loud_sound:"]
  --limit, -l      Set limit for Spotify API result lists [number] [default: 20]
  --id, -I         Set the Spotify client Id                 [string] [required]
  --secret, -S     Set the Spotify client secret             [string] [required]
  --verbose, -v    Increase verbosity                                    [count]
  --help, -h       Show help                                           [boolean]
```

For general Slack integration information please refer to the official Slack [documentation](https://api.slack.com/custom-integrations/legacy-tokens).

In the channel where you have added dopebot try: `help` to list all commands.

For Spotify search integration please create an [app](https://developer.spotify.com/my-applications/) to generate client and secret. 

## Contributors

- [Philipp Kitzberger](https://github.com/kitzberger)
- [Ernesto Baschny](http://cron.eu)
- [Sebastian Krüger](http://theblackestbox.net)

## License

MIT © [Sebastian Krüger](http://theblackestbox.net)
