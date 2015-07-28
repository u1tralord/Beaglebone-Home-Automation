var Forecast = require('forecast.io');
var events = require('events');
var util = require('util');

exports.Module = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new ForecastWeather(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function ForecastWeather(log, settings, moduleName){
	events.EventEmitter.call(this);
	
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	
	this.acceptedCommands = this.settings.acceptedCommands;
}
util.inherits(ForecastWeather, events.EventEmitter);

ForecastWeather.prototype.init = function(){
	var API_key = this.settings.API_key;
	var timeoutMs = this.settings.timeout;
	
	var options = {
	  APIKey: API_key,
	  timeout: timeoutMs
	};
	forecast = new Forecast(options);
	this.forecast = forecast;
	
	this.interval = setInterval(this.update, this.settings.update_rate, this);
	
	this.running = true;
}

ForecastWeather.prototype.update = function(thisEmitter) {
	//thisEmitter.emit('command');
	log = thisEmitter.log;
	settings = thisEmitter.settings;
	forecast = thisEmitter.forecast;
	
	//34.038643, -83.829686
	var options = {
	  exclude: 'flags,alerts'
	};
	var location = settings.locations['current'] != null ? settings.locations['current'] : settings.locations[settings.locations.default];
	log.write("Checking location: " +  location, "", 2);
	forecast.get(location[0], location[1], options, function (err, res, data) {
		if (err) throw err;
		log.write('Getting data from forecast.io', '', 4);
		//console.log('data: ' + util.inspect(data));
	});
}
ForecastWeather.prototype.execCommand = function(commandArgs){
	if(this.running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

ForecastWeather.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

ForecastWeather.prototype.close = function(){
	this.running = false;
	clearInterval(this.interval);
}