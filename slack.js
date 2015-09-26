var util = require("util");
var EventEmitter = require("events");

var Entities = require('html-entities').XmlEntities,
	entities = new Entities();

var Slack = require('slack-client');
var Message = require('./node_modules/slack-client/src/message');

var SlackMusic = require('./music');

var validCommands = [ '!pp', '!ppmusic', '!ppgoogle'];

function SlackCommandDispatcher() {
	EventEmitter.call(this);
}

util.inherits(SlackCommandDispatcher, EventEmitter);

/**
 * Event dispatcher for slack message command.
 * 
 * @param string cmd
 * @param object ooptions
 * @event triggers event {cmd}
 */
SlackCommandDispatcher.prototype.dispatch = function(cmd, options) {
	if(validCommands.indexOf(cmd) === -1) {
		console.log('Invalid command.', cmd);
		return;
	}

	console.log('[EVENT]:', cmd, 'message: ', options.clean_message);

	this.emit(cmd, options);
}

var commandDispatcher = new SlackCommandDispatcher();

//SPOTIFY MUSIC EVENTS.
var slackMusic = new SlackMusic(commandDispatcher);


module.exports = function(options) {

	if(typeof options !== 'object' && !options.hasOwnProperty('API_KEY')) {
		return new Error('Invalid slack options.');
	}

	if(options.API_KEY === null) {
		return new Error('Invalid API KEY');
	}

	function cleanMessage(message) {
		message = message.replace(/<|>/g, '');
		console.log('new message: ', message);

		return message.split(" ").filter(function(bits) {
			return !(bits === '');
		});
	}
	
	console.log('[SlackClient] init.');
	var SlackClient = new Slack(options.API_KEY, true, true);
	var SlackHandler = (function() {
		return {
			open: function() {
				console.log('[SlackClient] Connected');	
			},
			error: function(error) {
				console.error('[SlackClient] ERROR: ' + error);
				process.exit(1);
			},
			close: function() {
				console.error('[SlackClient] closed');
				process.exit(1);
			},
			message: function(message) {
				var user;

				try{
					user = message.getUserByID(message.user);
				}catch(e) {
					user = message.user;
				}
				console.log('the user: ', user);
				//for slack behaviour that autorender the post if media and pages.
				//treated as a new message entry.
				if (!message.user || typeof user === 'undefined') {
					return;
				}

				var channel = SlackClient.getChannelGroupOrDMByID(message.channel);
				var cleaned_message = cleanMessage(entities.decode(message.text));

				console.log('the cleaned message: ', cleaned_message);
				var cmd = cleaned_message[0].trim();

				if(validCommands.indexOf(cmd) === -1) {
					console.log('Ignore command.', cmd);
					return;
				}

				commandDispatcher.dispatch(cmd, {
					user: user,
					channel: channel,
					message: message.text,
					clean_message: cleaned_message
				});
			}
		};
	})();

	SlackClient.login();
	SlackClient.on('open', SlackHandler.open);
	SlackClient.on('error', SlackHandler.error);
	SlackClient.on('close', SlackHandler.close);
	SlackClient.on('message', SlackHandler.message);
}