var events = require('events');
var util = require('util');
var bonescript = require('bonescript');

exports.Module = function(log, settings, moduleName){
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
	
	//Initialize Pin States
	var pin_map = this.settings.pin_map;
	for(pinID in pin_map)
	{
		bonescript.pinMode(pinID, pin_map[pinID].isOutput ? bonescript.OUTPUT : bonescript.INPUT);
		pin_control.pin_map[pinID].pwmEnabled = this.settings.pwmAvailable.indexOf(pinID) > -1;
	}
	
	var writePinState = this.writePinState;
	this.outputUpdater = setInterval(function(){
		for(pinID in pin_map){
			this.writePinState(pinID, pin_map[pinID].value, pin_map[pinID].pwmEnabled);
		}
	}, this.settings.update_rate);
	
	this.running = true;
}

PinController.prototype.execCommand = function(commandArgs){
	if(this.running){
		if(commandArgs.command == 'setPinValue')
			this.setPinValue(commandArgs); //pinName = "", pinValue = x

		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

PinController.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

PinController.prototype.close = function(){
	this.running = false;
}
PinController.setPinValue = function(commandArgs){
	if(isValidPinData(commandArgs)){
		for(pinID in this.settings.pin_map){
			if(pinID == commandArgs.pinName || this.settings.pin_map[pinID].label == commandArgs.pinName)
				this.settings.pin_map[pinID].value = commandArgs.pinValue;
		}
	}
}
PinController.writePinState = function(pinID, value, pwmEnabled){
	if(value >= 0 && value <= 1){
		if(pwmEnabled)
			bonescript.analogWrite(pinID, value, 2000);
		else
			bonescript.digitalWrite(pinID, Math.round(value));
	}
}

function isValidPinData(pinData){
	if(pinData.hasOwnProperty('pinName') && pinData.hasOwnProperty('pinValue'))
		return true;
	else
		return false;
}