var request = require('request');
var EventEmitter = require("events");
var cmdExec = require('child_process').execSync;
var shellescape = require('shell-escape');
var EVENT_NAME = '!ppsay';

module.exports = function(CommandDispatcher, slackMusic) {
    if(typeof CommandDispatcher !== 'object') {
        console.log('CommandDispatcher not an Object');
        return;
    }

    if(!CommandDispatcher instanceof EventEmitter) {
        console.log('CommandDispatcher not an instance of EventEmitter');
        return;
    }

     CommandDispatcher.on(EVENT_NAME, function(details) {
     	var baseCmd = details.clean_message.shift();
     	var message = details.clean_message.join(" ");

     	var mAction = {
     		pause: function() {
     			slackMusic._request('pause');		
     		},
     		play: function() {
     			slackMusic._request('play');
     		}
     	};


     	mAction.pause();

     	setTimeout(function() {
     		var escaped = shellescape(['say', '-v', 'Vicki', message]);
			cmdExec(escaped);

			setTimeout(function() {
				mAction.play();	
			}, 500);
			
     	}, 1000);
		
     });
}