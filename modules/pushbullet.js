var PushBullet = require('pushbullet');
var events = require('events');
var util = require('util');

exports.Module = function(log, settings, moduleName){
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
	this.log.write_time("Pushbullet is started", "", 3);

	//this.sendPush({type:'note', deviceName:'LGG3', title:'Test', body:'Test Body'});
}

PushBulletClient.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

PushBulletClient.prototype.close = function(){
	this.running = false;
	console.log(this);
	this.stream.close();
}

PushBulletClient.prototype.listenForPush = function(){
	this.stream.on('push', this.processPush.bind(this));
}
PushBulletClient.prototype.deleteLastPush = function(title, body){
	this.pusher.history({limit: 1, modified_after: 1438170000.00000}, function(error, response) {
		if(response.pushes[0] != null && response.pushes[0].title == title && response.pushes[0].body == body)
			this.pusher.deletePush(response.pushes[0].iden, function(error, response) {});
	}.bind(this));
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
	this.log.write("Type:  " + push.type, "", 4);
	
	if(push.type == "clip"){
		var body = push.body.split(":");
		if(body[1] != null){
			var title = body[0];
			body = body[1].trim();
			
			if(title == this.settings.push_command_code){
				if(this.settings.approved_users.indexOf(push.source_user_iden) > -1){
					var args = parse_push_data(body);
					this.log.write_time("Push: " + JSON.stringify(args), "", 4);
					this.emit('command', args);
					this.deleteLastPush(title, body);
				}
				else
					this.log.write("Unapproved Sender", "", 2);
			}
			else
				this.log.write("Not a command", "", 4);
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

//Add commands here!

PushBulletClient.prototype.sendPush = function(pushData){
	if(pushData.hasOwnProperty('deviceName') && pushData.hasOwnProperty('title') && pushData.hasOwnProperty('body')){
		this.pusher.devices(function(err, res){
			res.devices.forEach(function(device){
				if(device.nickname == pushData.deviceName){
					this.pusher.note(device.iden, 
							pushData.title, 
							pushData.body, 
							function(er, res) {}
							);
				}
			}.bind(this));
		}.bind(this));
	}
}
/*if(dev.nickname == "LGE VS985 4G")
{
	console.log("Sending push!");
	pusher.note(dev.iden, "TITLE!", "MESSAGE!", function(err, res){
		console.log(err);
		console.log(res);
	});
}*/