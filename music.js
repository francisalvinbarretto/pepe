var util = require('util');
var EventEmitter = require('events');
var request = require('request');

var music_providers = {
	francis: "192.168.254.106:3000"
};

var EVENT_NAME = '!ppmusic';
var ACTIONS = [ 'play', 'pause', 'next', 'prev', 'playing', 'vol/low', 'vol/mid', 'vol/party', 'mute', 'unmute' ];

function Music() {}

Music.prototype._request = function(action, options, cb) {

	if(typeof options === 'function') {
		cb = options;
		options = {};
	}

	var url = ['http://', music_providers.francis, '/spotifyer/sonata-' + action].join("");
	request({ url: url }, function(err, response, body) {
		cb(err, body);
	});
}

var Spotify = new Music();
module.exports = function(CommandDispatcher) {
	if(typeof CommandDispatcher !== 'object') {
		console.log('CommandDispatcher not an Object');
		return;
	}

	if(!CommandDispatcher instanceof EventEmitter) {
		console.log('CommandDispatcher not an instance of EventEmitter');
		return;
	}

	CommandDispatcher.on(EVENT_NAME, function(details) {
		console.log(EVENT_NAME,': ', details.user, details.clean_message);

		var action = details.clean_message[1];
		var channel = details.channel;

		var cb = function(err, response) {
			if(!err) {
				var resJson = JSON.parse(response);
				console.log('json: ', resJson);

				var payload = {
					message: { 
						text: resJson.message.spotify_url,
						username: '!ppmusic',
						icon_emoji: ':musical_note:'
					},
					channel: channel
				};

				CommandDispatcher.emit('send_response', payload);
			}
		};

		if(ACTIONS.indexOf(action) !== -1) {
			Spotify._request(action, cb);
		}else {
			var spotify_match = /(spotify:(.*))/gi.exec(action);
			if(spotify_match !== null) {
				console.log('\tPlaying track: ', spotify_match[0]);
				Spotify._request('playtrack/' + spotify_match[0], cb);
			}
		}
	});
}