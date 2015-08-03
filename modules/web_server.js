var bodyParser = require('body-parser');
var connect = require('connect');
var events = require('events');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var serveStatic = require('serve-static');
var util = require('util');
util.inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;

	this.devices = {};

	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	//console.log(path.join(this.dataDir, '/client'));
	app.use(express.static(path.join(this.dataDir, '/client')));
	
	//console.log("MUSIC PATH: "+this.settings.mediaPath.music);
	app.use('/media/music', express.static(this.settings.mediaPath.music));
	app.use('/media/videos', express.static(this.settings.mediaPath.videos));
	app.use('/media/photos', express.static(this.settings.mediaPath.photos));
	
	io.on('connection', this.handleConnection.bind(this));
	
	http.listen(port, function(){
		this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	}.bind(this));
	
	this.running = true;
}

module.exports.prototype.handleConnection = function(socket){
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

module.exports.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

module.exports.prototype.close = function(){
	this.running = false;
	this.log.write_time("Server shutting down", "", 2);
	//this.server.close();
	this.log.write_time("Server successfully closed", "", 2);
}

//////////////////////////////////////////

module.exports.prototype.streamVideo = function(commandArgs){
	if(commandArgs.devName && commandArgs.videoURL && this.devices[commandArgs.devName])
	{
		this.devices[commandArgs.devName].socket.emit('streamVideo', {url:commandArgs.videoURL});
	}
}

module.exports.prototype.streamAudio = function(commandArgs){
	//commandArgs.audioURL = path.join(this.settings.mediaPath.music, commandArgs.artist, commandArgs.album, commandArgs.track + '.mp3');
	
	if(commandArgs.devName && commandArgs.audioURL && this.devices[commandArgs.devName])
	{
		this.devices[commandArgs.devName].socket.emit('streamAudio', {url:commandArgs.audioURL});
	}
}