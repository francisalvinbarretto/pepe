


console.log('            ~ I am pepe. Welcome. ~\n\n\n');

console.log(process.env);
var SlackScript = require('./slack')({ API_KEY: process.ENV.SLACK_API_KEY || null });


var music_servers = {
	francis: "192.168.128.228:3000"
};

