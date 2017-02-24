# dopebot

Slack bot which connects with Mopidy and Spotify.

## Installation

1. `npm install dopebot --global`

## Usage

`dopebot --token "<SLACK_TOKEN>" --channel "<SLACK_CHANNEL>" --mopidy "<MOPIDY_URL>" --brain`

Please see `dopebot --help`:

```
Usage: dopebot [options]

Options:
  --token, -t       Set token for the Slack API              [string] [required]
  --channel, -c     Set the Slack channel name to listen for input
                                                             [string] [required]
  --mopidy, -m, -m  Set the WS-URL of Mopidy
                             [string] [default: "ws://localhost:6680/mopidy/ws"]
  --dialog, -d      Only respond to <@dopebot>        [boolean] [default: false]
  --brain, -b       Remember user commands            [boolean] [default: false]
  --unfurl, -u      Unfold Spotify URIs in Slack      [boolean] [default: false]
  --emoji, -e       Dopebot emoji icon in Slack
                                              [string] [default: ":loud_sound:"]
  --limit, -l       Set limit for Spotify API result lists[number] [default: 20]
  --verbose, -v     Increase verbosity                                   [count]
  --help, -h        Show help                                          [boolean]
```

For general Slack integration information please refer to the official Slack documentation.
In the channel where you have added dopebot try: `@dopebot help` to list all commands.

## Contributors

- [Ernesto Baschny](http://cron.eu)
- [Sebastian Krüger](http://theblackestbox.net)

### Want to contribute?

Welcome! Glad, to hear. It's easy. Just follow theses steps:

1. Fork the project & branch
2. Code and document your stuff
3. Create a Pull Request with description

## License

## License

MIT © [Sebastian Krüger](http://theblackestbox.net)
