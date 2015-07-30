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
	//this.data_dir is where all module-related files should be stored
	// it is automatically generated when the module is loaded and is placed in the settings.path.data location
	
	//this.server = connect().use(serveStatic(this.settings.clientPath));
}
util.inherits(WebServer, events.EventEmitter);

WebServer.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;
	
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);
	app.use(express.static(path.join(this.data_dir, '/client')));
	io.on('connection', function(socket){
		console.log('a user connected');
		socket.emit('test', {serverID:404});
		socket.on('disconnect', function(){
			console.log('user disconnected');
		});
	});
	http.listen(port, function(){
	  console.log('listening on port: ' + port);
	});
	
	//this.server.listen(port, ip);
	this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	this.running = true;
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