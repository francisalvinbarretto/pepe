var fs = require('fs');
var request = require('request');
var EventEmitter = require("events");
var EVENT_NAME = '!ppgif';

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
        request({ url: 'http://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&rating=pg-13&limit=1&q=' + query + '&internal=yes' }, function(err, response, body) {
            console.log('response: ', body);

            var gifs;

            result = JSON.parse(body);
            gifs = result.data;
            var content = "No Results.";
            if ((gifs != null ? gifs.length : void 0) > 0) {
                gif = gifs[0];
                CommandDispatcher.emit('send_response', {
                    message: {
                        username: 'pepe',
                        markdwn: true,
                        icon_emoji: ':pepe:',
                        attachments: [
                            {
                                text: "",
                                image_url: gif.images.downsized.url
                            }
                        ]
                    },
                    channel: channel
                });
            }else {
                CommandDispatcher.emit('send_response', {
                    message: {
                        text: content,
                        username: EVENT_NAME,
                        markdwn: true,
                        icon_emoji: ':pepe:'
                    },
                    channel: channel
                });
            }
        });
    });
}