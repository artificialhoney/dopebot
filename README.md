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
-d, --dialog         Only respond to [@dopebot]
-l, --limit [limit]  Set [limit] for Spotify API result lists
-v, --verbose        Increase verbosity
```

For general Slack integration information please refer to the official Slack documentation.
In the channel where you have added dopebot try: `@dopebot help` to list all commands:


**search [types...] [query]**: Search Spotify

[types] can contain "album, artist, playlist or track"

Example: _search album,track Beatles_
___
**play [type] [index]**: Play Spotify-URI from search

This commands refers to the run search before

Example: _play album 5_
___
**queue [type] [index]**: Enqueue Spotify-URI from search

This commands refers to the run search before

Example: _queue album 5_
___
**play [spotify_uri]**: Play Spotify-URI

[spotify_uri] can be obtained from a Spotify client app

Example: _play [spotify_uri]_
___

**queue [spotify_uri]**: Enqueue Spotify-URI

[spotify_uri] can be obtained from a Spotify client app

Example: _queue [spotify_uri]_
___
**current**: Get current track from Mopidy
___
**tracks**: Get current tracklist from Mopidy
___
**next**: Play next track from tracklist
___
**previous**: Play previous track from tracklist
___
**pause**: Pause current track
___
**resume**: Resume current track
___
**stop***: Stop playback
___
**volume [0-100]**: Get/Set Volume

Without volume percentage, the volume is read from Mopidy

Example: _volume 55_
___
**state**: Get playback state
___

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