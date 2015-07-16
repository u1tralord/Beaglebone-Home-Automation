var PushBullet = require('pushbullet');
var events = require('events');
var util = require('util');

exports.createModule = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new PushBulletClient(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function PushBulletClient(log, settings, moduleName){
	events.EventEmitter.call(this);
	
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	
	//this.commandEmitter = new events.EventEmitter();
	this.acceptedCommands = this.settings.acceptedCommands;
}
util.inherits(PushBulletClient, events.EventEmitter);

PushBulletClient.prototype.init = function(){
	this.pusher = new PushBullet(this.settings.API_key);
	this.log.write("Instance started with API key: " + this.settings.API_key, "", 3);
	this.log.write("Approved Users: " + JSON.stringify(this.settings.approved_users), "", 3);
	this.log.write("Command Code: " + this.settings.push_command_code, "", 3);
	
	this.stream = this.pusher.stream();
	this.log.write("Stream created", "", 3);
	
	this.stream.on('push', this.processPush);
	this.stream.on('connect', this.processConnect);
	this.stream.connect();
	this.running = true;
	this.log.write("Pushbullet is listening", "", 3);
}

PushBulletClient.prototype.execCommand = function(command){
	if(running){
		this.log.write("Processing command: " + JSON.stringify(command), "", 1);
	}
}

PushBulletClient.prototype.close = function(){
	this.running = false;
	this.stream.close();
}

PushBulletClient.prototype.processConnect = function(){
	//this.log.write("Stream connected", "", 3);
}

PushBulletClient.prototype.processPush = function(push){
	//this.log.write("New Push Detected", "", 3);
	//this.log.write("Type:  " + push.type, "", 4);
	
	if(push.type == "clip"){
		var body = push.body.split(":");
		if(body[1] != null){
			var title = body[0];
			body = body[1].trim();
			
			if(title = this.settings.push_command_code){
				if(this.settings.approved_users.indexOf(push.source_user_iden) > -1){
					var args = parse_push_data(body);
					//log.write("Push: " + JSON.stringify(args), "", 4);
					//this.commandEmitter.emit('command', args);
				}
				else{}
					//log.write("Unapproved Sender", "", 2);
			}
			else{}
				//log.write("Not a command", "", 4);
		}
	}
}

PushBulletClient.prototype.getMeIden = function(){
	this.pusher.me(function(err, res){
		console.log(res);
	});
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

/*if(dev.nickname == "LGE VS985 4G")
{
	console.log("Sending push!");
	pusher.note(dev.iden, "TITLE!", "MESSAGE!", function(err, res){
		console.log(err);
		console.log(res);
	});
}*/