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
	var processCommand = this.processCommand;
	var modules = this.modules;
		
	for(var moduleName in this.modules){		
		modules[moduleName].on('command', function(args){
			if(args.hasOwnProperty('command')){
				this.log.write("Command received: "+ JSON.stringify(args), "", 3);
				processCommand(modules, args);
			}
		});
		modules[moduleName].init();
	}
}

CommandProcessor.prototype.processCommand = function(modules, args){
	
	for(var moduleName in this.modules){
		console.log(modules[moduleName]);
		if(modules[moduleName].acceptedCommands.indexOf(args.command) > -1)
		{
			console.log("SENDING COMMAND TO: " + moduleName);
		}
	}
}
