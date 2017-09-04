# dopebot

Slack bot which connects with Mopidy and Spotify.

## Installation

1. `npm install dopebot --global`

## Usage


`dopebot --token "<SLACK_TOKEN>" --channel "<SLACK_CHANNEL>" --id "<SPOTIFY_CLIENT_ID>" --secret "<SPOTIFY_CLIENT_SECRET>" --code "<SPOTIFY_CODE>" --mopidy "<MOPIDY_URL>" --brain`

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
  --limit, -l, -l   Set limit for Spotify API result lists[number] [default: 20]
  --id, -i          Set the Spotify client Id                [string] [required]
  --secret, -s      Set the Spotify client secret            [string] [required]
  --code, -x        Set the Spotify code                     [string] [required]
  --verbose, -v     Increase verbosity                                   [count]
  --help, -h        Show help                                          [boolean]
```

For general Slack integration information please refer to the official Slack documentation.
In the channel where you have added dopebot try: `help` to list all commands.
For Spotify search integration please see [documentation](https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow). You need to create a spotify app and generate a code, like with the following request: `https://accounts.spotify.com:443/authorize?client_id=5fe01282e44241328a84e7c5cc169165&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email&state=some-state-of-my-choice` 

## Contributors

- [Ernesto Baschny](http://cron.eu)
- [Sebastian Krüger](http://theblackestbox.net)

## License

MIT © [Sebastian Krüger](http://theblackestbox.net)
