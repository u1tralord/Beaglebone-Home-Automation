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
}
util.inherits(PinController, events.EventEmitter);

PinController.prototype.init = function(){
	
	//Initialize Pin States
	var pin_map = this.settings.pin_map;
	for(pinID in pin_map)
	{
		bonescript.pinMode(pinID, pin_map[pinID].isOutput ? bonescript.OUTPUT : bonescript.INPUT);
		pin_map[pinID].pwmEnabled = this.settings.pwmAvailable.indexOf(pinID) > -1;
	}
	this.updateOutputs();
	this.outputUpdater = setInterval(this.updateOutputs.bind(this), this.settings.update_rate);
	
	this.running = true;
}

PinController.prototype.execCommand = function(commandArgs){
	if(this.running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
		
		if(commandArgs.command == 'setPinValue')
			this.setPinValue(commandArgs); //pinName = "", pinValue = x
	}
}

PinController.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

PinController.prototype.close = function(){
	this.running = false;
	clearInterval(this.outputUpdater);
}

PinController.prototype.updateOutputs = function(){
	var pinsModified = false; //Keeps track of if any pins were updated this cycle.
	
	for(pinID in this.settings.pin_map){
		if(this.settings.pin_map[pinID].modified){
			this.writePinState(pinID, this.settings.pin_map[pinID].value, this.settings.pin_map[pinID].pwmEnabled);
			this.settings.pin_map[pinID].modified = false;
			pinsModified = true; 
		}
	}
	
	if(pinsModified){
		this.log.write(util.inspect(this.settings.pin_map), "", 4);
	}
}

PinController.prototype.updateInputs = function(){
	var pinsModified = false; //Keeps track of if any pins were updated this cycle.
	
	for(pinID in this.settings.pin_map){
		if(!this.settings.pin_map[pinID].isOutput){
			var oldValue = this.settings.pin_map[pinID].value;
			
			if(this.settings.pin_map[pinID].pwmEnabled){
				bonescript.analogRead(pinID, function(readData){
					this.settings.pin_map[pinID].value = readData.value;
					if(oldValue != this.settings.pin_map[pinID].value){
						this.log.write("Analog value changed: " + oldValue + " -> " + this.settings.pin_map[pinID].value, "", 3);
						this.settings.pin_map[pinID].modified = true;
						pinsModified = true;
					}
					if(readData.err)
						this.log.write_err(readData.err);
				}.bind(this));
			}
			else{
				bonescript.digitalRead(pinID, function(readData){
					this.settings.pin_map[pinID].value = readData.value;
					if(oldValue != this.settings.pin_map[pinID].value){
						this.log.write("Digital value changed: " + oldValue + " -> " + this.settings.pin_map[pinID].value, "", 3);
						this.settings.pin_map[pinID].modified = true;
						pinsModified = true;
					}
					if(readData.err)
						this.log.write_err(readData.err);
				}.bind(this));
			}
		}
	}
	
	if(pinsModified){
		this.log.write(util.inspect(this.settings.pin_map), "", 4);
	}
}

PinController.prototype.writePinState = function(pinID, value, pwmEnabled){
	if(value >= 0 && value <= 1){
		if(pwmEnabled)
			bonescript.analogWrite(pinID, value, 2000);
		else
			bonescript.digitalWrite(pinID, Math.round(value));
	}
}

function isValidPinData(pinData){
	return pinData.hasOwnProperty('pinName') && pinData.hasOwnProperty('pinValue');
}

///////////////////////////
PinController.prototype.setPinValue = function(commandArgs){
	console.log(commandArgs);
	for(pinName in commandArgs){
		pinValue = commandArgs[pinName];

		for(pinID in this.settings.pin_map){
			if((pinID == pinName || this.settings.pin_map[pinID].label == pinName) && this.settings.pin_map[pinID].isOutput){ //Use the pin ID or the label given in the config to as the pinName to access this pin
				this.settings.pin_map[pinID].value = pinValue;
				this.settings.pin_map[pinID].modified = true;  //This tells updateOutputs() that this pin needs to be updated
				this.log.write("Setting pin: " + pinName + " to " + pinValue, "", 2);
			}
		}
	}
}