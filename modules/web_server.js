var bodyParser = require('body-parser');
var connect = require('connect');
var events = require('events');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var serveStatic = require('serve-static');
var util = require('util');

exports.createModule = function(log, settings, moduleName){
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
	this.acceptedCommands = this.settings.acceptedCommands;

	this.server = connect().use(serveStatic(this.settings.clientPath));
}
util.inherits(WebServer, events.EventEmitter);

WebServer.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;

	this.server.listen(port, ip);
	this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	this.running = true;
}

WebServer.prototype.execCommand = function(commandArgs){
	if(running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

WebServer.prototype.close = function(){
	this.running = false;
	this.log.write_time("Server shutting down", "", 2);
	this.server.close();
	this.log.write_time("Server successfully closed", "", 2);
}