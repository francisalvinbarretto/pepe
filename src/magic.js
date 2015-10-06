var fs = require('fs');
var request = require('request');
var EventEmitter = require("events");
var EVENT_NAME = '!ppmagic';

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
        console.log('channel: ', details.channel.name);

        var action = details.clean_message;
        var channel = details.channel;
        var image_url = '';
        var query = [];

        console.log('cl: ', details.clean_message);
        for(var i = 1; i<= details.clean_message.length; i++) {
            query.push(details.clean_message[i]);
        }


        switch(action) {
            case 'janean':
                image_url = 'https://slack-files.com/files-pub/T03SX641L-F0B81PRL1-f6dc4cd4b7/screen_shot_2015-09-24_at_2.39.45_pm.png';
                break;
            default:
                break;
        }

        if(image_url == '' && details.channel.name.indexOf('manila') !== -1) {
            return;
        }

        CommandDispatcher.emit('send_response', {
            message: {
                username: 'pepe',
                markdwn: true,
                icon_emoji: ':pepe:',
                attachments: [
                    {
                        text: "",
                        image_url: image_url
                    }
                ]
            },
            channel: channel
        });
    });
}