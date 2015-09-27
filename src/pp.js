var fs = require('fs');
var EventEmitter = require("events");
var EVENT_NAME = '!pp';
var path = require('path');

var ACTIONS = ['help', 'hello'];

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


		switch(action) {
			case 'help': 
				fs.readFile(path.resolve(process.cwd() + '/PPhelp.txt'), 'utf8', function(err, contents) {
					console.log(err, contents);
					if(!err) {
						CommandDispatcher.emit('send_response', {
							message: {
								text: "`" + contents + "`",
								username: EVENT_NAME,
								markdwn: true,
								icon_emoji: ':pepe:'
							},
							channel: channel
						});	
					}
				});
				break;
			case 'hello': 
			default:
				CommandDispatcher.emit('send_response', {
					message: {
						text: "Hello I'm Pepe, Your friendly BOT! kain PEPE? type *!pp help* to display list of commands",
						username: EVENT_NAME,
						markdwn: true,
						icon_emoji: ':pepe:'
					},
					channel: channel
				});	
		}
	});
}