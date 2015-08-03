var Forecast = require('forecast.io');
var events = require('events');
var util = require('util');
util.inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.init = function(){
	var API_key = this.settings.API_key;
	var timeoutMs = this.settings.timeout;
	
	var options = {
	  APIKey: API_key,
	  timeout: timeoutMs
	};
	this.forecast = new Forecast(options);
	this.log.write("Successfully connected to forecast.io API", "", 3);
	this.interval = setInterval(this.update.bind(this), this.settings.update_rate, this);
	
	this.running = true;
}

module.exports.prototype.update = function() {
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

module.exports.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

module.exports.prototype.close = function(){
	this.running = false;
	clearInterval(this.interval);
}


//////////////////////////////
module.exports.prototype.setLoc = function(commandArgs){
	if(commandArgs.hasOwnProperty('lat') && commandArgs.hasOwnProperty('long')){
		this.settings.locations['current'] = [commandArgs.lat, commandArgs.long];
		this.log.write("New location: " + this.settings.locations.current[0] + ", " + this.settings.locations.current[1], "", 3);
	}
}