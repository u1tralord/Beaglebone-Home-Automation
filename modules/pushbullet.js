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
	
	this.listenForConnect();
	this.listenForPush();
	
	this.stream.connect();
	this.running = true;
	this.log.write_time("Pushbullet is listening", "", 3);

	//this.sendPush({type:'note', deviceName:'LGG3', title:'Test', body:'Test Body'});
}

PushBulletClient.prototype.execCommand = function(commandArgs){
	if(this.running){
		if(commandArgs.command == 'sendPush')
			this.sendPush(commandArgs);

		this.log.write_time("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

PushBulletClient.prototype.close = function(){
	this.running = false;
	this.stream.close();
}

PushBulletClient.prototype.listenForPush = function(){
	var log = this.log;
	var thisEmitter = this;
	var settings = this.settings;
	
	this.stream.on('push', function(push){
		log.write("New Push Detected", "", 3);
		log.write("Type:  " + push.type, "", 4);
		
		if(push.type == "clip"){
			var body = push.body.split(":");
			if(body[1] != null){
				var title = body[0];
				body = body[1].trim();
				
				if(title == settings.push_command_code){
					if(settings.approved_users.indexOf(push.source_user_iden) > -1){
						var args = parse_push_data(body);
						log.write_time("Push: " + JSON.stringify(args), "", 4);
						thisEmitter.emit('command', args);
					}
					else
						log.write("Unapproved Sender", "", 2);
				}
				else
					log.write("Not a command", "", 4);
			}
		}
	});
}

PushBulletClient.prototype.listenForConnect = function(){
	var log = this.log;
	var thisEmitter = this;
	this.stream.on('connect', function(){
		log.write_time("Stream connected", "", 3);
	});
}

PushBulletClient.prototype.processPush = function(push){
	this.log.write("New Push Detected", "", 3);
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

PushBulletClient.prototype.getMyIden = function(){
	var iden = null;
	this.pusher.me(function(err, res){
		iden = res.iden;
	});
	return iden;
}

function isValidPushData(pushData){
	if(pushData.hasOwnProperty('type') && pushData.hasOwnProperty('deviceName')){
		if(pushData.type == 'note' && pushData.hasOwnProperty('title') && pushData.hasOwnProperty('body'))
			return true;
	}
	else
		return false;
}

PushBulletClient.prototype.sendPush = function(pushData){
	var pusher = this.pusher;
	var log = this.log;

	if(isValidPushData(pushData)){
		if(pushData.type == 'note'){
			this.pusher.devices(function(err, res){
				res.devices.forEach(function(device){
					if(device.nickname == pushData.deviceName){
						pusher.note(device.iden, 
								pushData.title, 
								pushData.body, 
								function(er, res) {}
								);
					}
				});
			});
		}
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

/*if(dev.nickname == "LGE VS985 4G")
{
	console.log("Sending push!");
	pusher.note(dev.iden, "TITLE!", "MESSAGE!", function(err, res){
		console.log(err);
		console.log(res);
	});
}*/