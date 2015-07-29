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
	
	this.interval = setInterval(this.update.bind(this), this.settings.update_rate, this);
	
	this.running = true;
}

ForecastWeather.prototype.update = function() {
	var options = {
	  exclude: 'flags,alerts'
	};
	var location = this.settings.locations['current'] != null ? this.settings.locations['current'] : this.settings.locations[this.settings.locations.default];
	this.log.write("Checking location: " +  location, "", 2);
	this.forecast.get(location[0], location[1], options, function (err, res, data) {
		if (err) throw err;
		this.log.write('Getting data from forecast.io', '', 4);
		//console.log('data: ' + util.inspect(data));
	}.bind(this));
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


//////////////////////////////
ForecastWeather.prototype.setLoc = function(commandArgs){
	if(commandArgs.hasOwnProperty('lat') && commandArgs.hasOwnProperty('long')){
		this.settings.locations['current'] = [commandArgs.lat, commandArgs.long];
		this.log.write("New location: " + commandArgs.lat + ", " + commandArgs.long, "", 3);
	}
}