var PushBullet = require('pushbullet');

var module_loader = require("../core/module_loader.js");
var events = require('events');
var pushsettings = module_loader.load_config("pushbullet.config");

var log;
var pusher;
var stream;

var commandEmitter = new events.EventEmitter();

exports.init = function(_log){
	log = _log;
	if(pushsettings != null){
		pusher = new PushBullet(pushsettings.API_key);
		log.write("Instance started with API key: " + pushsettings.API_key, "", 3);
		log.write("Approved Users: " + JSON.stringify(pushsettings.approved_users), "", 3);
		log.write("Command Code: " + pushsettings.push_command_code, "", 3);
		
		stream = pusher.stream();
		log.write("Stream created", "", 3);
		
		stream.on('push', function(push){
			log.write("New Push Detected", "", 3);
			log.write("Type:  " + push.type, "", 4);
			if(push.type == "clip"){
				var body = push.body.split(":");
				var title = body[0];
				body = body[1].trim();
				
				if(title = pushsettings.push_command_code){
					if(pushsettings.approved_users.indexOf(push.source_user_iden) > -1){
						var args = parse_push_data(body);
						log.write("Push: " + JSON.stringify(args), "", 4);
						commandEmitter.emit('command', args);
					}
					else
						log.write("UnApproved Sender", "", 4);
				}
				else
					log.write("Not a command", "", 4);
			}
		});

		stream.on('connect', function(){
			log.write("Stream connected", "", 3);
		});
		
		stream.connect();
		//this.update();
		log.write("Pushbullet is listening", "", 4);
	}
	else{
		log.write_err("Error: Config file not found.", "", 1);
		log.write_err("This module has been disabled", "", 1);
	}
}

function parse_push_data(pushBody){
	var args = {};
	//var args = new Array();
	if(pushBody != null){
		pushBody.split("&").forEach(function(arg){
			var key = arg.split("=")[0];
			var value = arg.split("=")[1];
			args[key] = value;
		});
	}
	return args;
}

exports.close = function(){
	stream.close();
}
/*if(dev.nickname == "LGE VS985 4G")
{
	console.log("Sending push!");
	pusher.note(dev.iden, "TITLE!", "MESSAGE!", function(err, res){
		console.log(err);
		console.log(res);
	});
}*/