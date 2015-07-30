var bodyParser = require('body-parser');
var connect = require('connect');
var events = require('events');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var serveStatic = require('serve-static');
var util = require('util');

exports.Module = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new WebServer(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function WebServer(log, settings, moduleName){
	events.EventEmitter.call(this);
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	this.devices = {};
	//this.data_dir is where all module-related files should be stored
	// it is automatically generated and set when the module is loaded and is placed in the settings.path.data location
}
util.inherits(WebServer, events.EventEmitter);

WebServer.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;
	
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	app.use(express.static(path.join(this.data_dir, '/client')));
	io.on('connection', this.handleConnection.bind(this));
	
	http.listen(port, function(){
		this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	}.bind(this));
	
	this.running = true;
}

WebServer.prototype.handleConnection = function(socket){
	var client = {};
	
	socket.on('devName', function(data){
		if(data.devName){
			client.socket = socket;
			client.registered = true; 
			client.deviceName = data.devName;
	
			this.devices[client.deviceName] = client;
			this.log.write('Device connected: ' + client.deviceName, "", 2);
		}
	}.bind(this));
	
	socket.on('disconnect', function(){
		if(client.deviceName)
			this.log.write('Device disconnected: ' + client.deviceName, "", 2);
		else
			this.log.write('Unregistered device disconnected', "", 2);
	}.bind(this));
}

WebServer.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

WebServer.prototype.close = function(){
	this.running = false;
	this.log.write_time("Server shutting down", "", 2);
	//this.server.close();
	this.log.write_time("Server successfully closed", "", 2);
}

//////////////////////////////////////////

WebServer.prototype.streamVideo = function(commandArgs){
	console.log("streaming video");
	var videoURL = 'http://www.w3schools.com/html/mov_bbb.mp4';
	if(commandArgs.devName && commandArgs.video && this.devices[commandArgs.devName])
	{
		this.devices.socket.emit('streamVideo', {url:videoURL});
	}
}