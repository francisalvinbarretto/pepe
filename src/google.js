var fs = require('fs');
var request = require('request');
var EventEmitter = require("events");
var EVENT_NAME = '!ppgoogle';

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
		var query = [];

		console.log('cl: ', details.clean_message);
		for(var i = 1; i<= details.clean_message.length; i++) {
			query.push(details.clean_message[i]);
		}
		query = encodeURIComponent(query.join(" "));
		request({ url: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' + query  }, function(err, response, body) {
			var page, pages, ref;
			
			console.log('response: ', body);

			pages = JSON.parse(body);
			pages = (ref = pages.responseData) != null ? ref.results : void 0;
			var content = "No Results.";
			if ((pages != null ? pages.length : void 0) > 0) {
				page = pages[0];
				CommandDispatcher.emit('send_response', {
					message: {
						text: "*" + page.titleNoFormatting + "*\n_ " + page.unescapedUrl + " _",
						username: EVENT_NAME,
						markdwn: true,
						icon_emoji: ':octocat:'
					},
					channel: channel
				});	
			}else {
				CommandDispatcher.emit('send_response', {
					message: {
						text: content,
						username: EVENT_NAME,
						markdwn: true,
						icon_emoji: ':octocat:'
					},
					channel: channel
				});	
			}
		});
	});
}