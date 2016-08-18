# dopebot

Slack bot which connects with Mopidy and Spotify.

## Installation

1. `git clone git@github.com:100hz/dopebot.git`
2. `cd dopebot && npm install`


## Usage

`bin/dopebot --token="[YOUR_SLACK_TOKEN]" --mopidy="ws://192.168.36.140:6680/mopidy/ws"`

Please see `bin\dopebot --help`:

```
  Usage: dopebot [options]

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -t, --token [token]  Set [token] for the Slack API
    -m, --mopidy [url]   Set [url] for the Mopidy API
    -d, --dialog         Only respond to <@dopebot>
    -h, --history        Keep user commands in memory
    -u, --unfurl         Unfold Spotify URIs in Slack
    -e, --emoji [emoji]  Dopebot emoji icon in Slack
    -l, --limit [limit]  Set [limit] for Spotify API result lists
    -v, --verbose        Increase verbosity
```

For general Slack integration information please refer to the official Slack documentation.
In the channel where you have added dopebot try: `@dopebot help` to list all commands:

`search (album|artist|playlist|track)?(.*)`: Searches Spotify for the given query

`play (album|artist|playlist|track) (\d+)`: Plays a Spotify resource from the last search

`queue (album|artist|playlist|track) (\d+)`: Enqueues a Spotify resource from the last search

`play (spotify:[\w:]+[a-zA-Z0-9]{22})`: Plays a Spotify URI

`queue (spotify:[\w:]+[a-zA-Z0-9]{22})`: Enqueues a Spotify URI

`(tracks|list)`: Prints out the current tracklist

`(clear|clean)`: Clears the tracklist

`(next|skip)`: Plays the next track from the tracklist

`prev`: Plays the previous track from the tracklist

`pause`: Pauses the current tracks

`resume`: Resumes the current tracks

`stop`: Stops playback

`play`: Plays current tracklist

`mode (consume|random|repeat|single)`: Gets a specific mode enabled state

`mode (consume|random|repeat|single) (true|false)`: Sets a specific mode enabled state

`(vol|volume)`: Gets the volume

`(vol|volume) (\d{1,3})`: Sets the volume

`(vol|volume) (up|down)`: Increases / Decreases the volume

`state`: Gets the current playback state

`help`: Prints out this message

## Contributors

- [Ernesto Baschny](http://cron.eu)
- [Sebastian Krüger](http://theblackestbox.net)

### Want to contribute?

Welcome! Glad, to hear. It's easy. Just follow theses steps:

1. Fork the project & branch
2. Code and document your stuff
3. Create a Pull Request with description

## License

(MIT License)

Copyright (c) 2016 Sebastian Krüger [sk@theblackestbox.net]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.