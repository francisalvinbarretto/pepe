var util = require('util');
var EventEmitter = require('events');
var request = require('request');

var music_providers = {
	// francis: "192.168.254.106:3000"
	francis: "192.168.128.228:3000"
};

var EVENT_NAME = '!ppmusic';

var SONATA_ACTIONS = ['play', 'pause', 'next', 'prev', 'playing' ];
var PLAYER_ACTIONS = ['vol/low', 'vol/mid', 'vol/party', 'mute', 'unmute', 'running', 'state'];
var ACTIONS = SONATA_ACTIONS.concat(PLAYER_ACTIONS);

function Music() {}

Music.prototype._request = function(action, options, cb) {

	if(typeof options === 'function') {
		cb = options;
		options = {};
	}

	var path = [ 
		'/spotifyer/', 
		PLAYER_ACTIONS.indexOf(action) != -1 ? 'player' : 'sonata' ,
		'-', 
		action 
	].join("");

	var url = ['http://', music_providers.francis, path].join("");
	request({ url: url }, function(err, response, body) {
		cb(err, body);
	});
}


Music.prototype.formatResponse = function(action, response) {
	switch(action) {
		case 'playing': 
			if(!response.error && response.message.spotify_url) {
				return { value: response.message.spotify_url, markdwn: false };
			}

			return false;
			break;
		case 'playtrack':
			if(response.error) {
				return { value: response.message, markdwn: false, icon: ':beetle:' };
			}
			break;
		case 'running': 
			if(!response.error) {
				return { value: response.message, markdwn: false };
			}
			break;
		case 'vol/low':
		case 'vol/mid':
		case 'vol/party':
			return { value: response.message, markdwn: false };
			break;
		case 'state': 
			var txt = [
				"*TRACK:* " + (typeof response.message.track_id == 'undefined' ? 'unavailable' : response.message.track_id),
				"*VOLUME:* " + (typeof response.message.volume  == 'undefined' ? 'unavailable' : response.message.volume),
				"*POSITION:* " + (typeof response.message.position == 'undefined' ? 'unavailable' : response.message.position),
				"*STATE:* " + (typeof response.message.state == 'undefined' ? 'unavailable' : response.message.state)
			].join("\n");

			return { value: txt, markdwn: true, icon: ':musical_note:'};
		default:
			return false;
	}
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
				var formattedResponse = Spotify.formatResponse(action, resJson);
				if(formattedResponse != false && typeof formattedResponse === 'object') {
					var payload = {
						message: { 
							text: formattedResponse.value,
							username: '!ppmusic',
							markdwn: formattedResponse.markdwn || false,
							icon_emoji: formattedResponse.icon || ':musical_note:'
						},
						channel: channel
					};

					CommandDispatcher.emit('send_response', payload);	
				}
			}
		};

		if(ACTIONS.indexOf(action) !== -1) {
			Spotify._request(action, cb);
		}else {
			var spotify_match = /(spotify:(.*))/gi.exec(action);
			if(spotify_match !== null) {
				action = 'playtrack';
				console.log('\tPlaying track: ', spotify_match[0]);
				Spotify._request(action + '/' + spotify_match[0], cb);
			}
		}
	});
}