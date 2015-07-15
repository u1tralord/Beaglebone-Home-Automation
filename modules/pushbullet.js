var PushBullet = require('pushbullet');

var module_loader = require("../core/module_loader.js");
var pushsettings = module_loader.load_config("pushbullet.config");

var log;
var pusher;
var stream;
var devices = {};


exports.init = function(_log){
	log = _log;
	if(pushsettings != null){
		pusher = new PushBullet(pushsettings.API_key);
		log.write("Instance started with API key: " + pushsettings.API_key, "", 3);
		
		stream = pusher.stream();
		log.write("Stream created", "", 3);
		
		stream.on('push', function(push){
			console.log(push);
		});

		stream.on('connect', function(){
			log.write("Stream connected", "", 3);
		});
		
		stream.connect();
	}
	else{
		log.write_err("Error: Config file not found.", "", 1);
		log.write_err("This module has been disabled", "", 1);
	}
}

exports.update = function(){
	
}

/*if(dev.nickname == "LGE VS985 4G")
{
	console.log("Sending push!");
	pusher.note(dev.iden, "TITLE!", "MESSAGE!", function(err, res){
		console.log(err);
		console.log(res);
	});
}*/

//stream.close();