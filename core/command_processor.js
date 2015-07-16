var path = require('path');

var module_loader = require('./module_loader.js');
var logger = require('./logger.js');

var module_name = path.basename(module.filename, path.extname(module.filename));


exports.getCommandProcessor = function(log){
	return new CommandProcessor(log);
}

function CommandProcessor(log){
	this.log = log;
	this.modules = [];
}

CommandProcessor.prototype.loadModules = function(module_loader_log){
	this.modules = module_loader.loadModules(GLOBAL["settings"].path.modules, module_loader_log);
	
	var events = require('events');
	for(var moduleName in this.modules){
		this.modules[moduleName].on('test', function(){
			console.log("SUPER COOL");
		});
		this.modules[moduleName].init();
	}
}

CommandProcessor.prototype.processCommand = function(args){
	this.log.write("GOTCHA!" + JSON.stringify(args));
}
