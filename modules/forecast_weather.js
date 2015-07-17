var Forecast = require('forecast.io');
var events = require('events');
var util = require('util');

exports.createModule = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new ForcastWeather(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function ForcastWeather(log, settings, moduleName){
	events.EventEmitter.call(this);
	
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	
	this.acceptedCommands = this.settings.acceptedCommands;
}
util.inherits(ForcastWeather, events.EventEmitter);

ForcastWeather.prototype.init = function(){
	var API_key = this.settings.API_key;
	var timeoutMs = this.settings.timeout;
	
	var options = {
	  APIKey: API_key,
	  timeout: timeoutMs
	},
	
	forecast = new Forecast(options);
	this.forecast = forecast;
	
	this.interval = setInterval(function() {
		forecast.get(34.038643, -83.829686, function (err, res, data) {
			if (err) throw err;
			console.log('Getting data from forecast.io');
			//console.log('data: ' + util.inspect(data));
		});
	}, this.settings.update_rate);
	
	this.running = true;
}

ForcastWeather.prototype.execCommand = function(commandArgs){
	if(this.running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

ForcastWeather.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

ForcastWeather.prototype.close = function(){
	this.running = false;
	clearInterval(this.interval);
}