var events = require('events');
var util = require('util');

exports.createModule = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new PinController(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function PinController(log, settings, moduleName){
	events.EventEmitter.call(this);
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	this.acceptedCommands = this.settings.acceptedCommands;
}
util.inherits(PinController, events.EventEmitter);

PinController.prototype.init = function(){
	
	this.running = true;
}

PinController.prototype.execCommand = function(commandArgs){
	if(this.running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

PinController.prototype.close = function(){
	this.running = false;
	
}