var path = require('path');

var module_loader = require('./module_loader.js');
var logger = require('./logger.js');

var module_name = path.basename(module.filename, path.extname(module.filename));


exports.CommandProcessor = function(log){
	return new CommandProcessor(log);
}

function CommandProcessor(log, module_loader_log){
	this.log = log;
	this.module_loader_log = logger.create_log(
		path.join(GLOBAL["settings"].path.logs, "MODULE_LOADER.log"), 
		"MODULE_LOADER" , 
		4);
	this.modules = {};
}

CommandProcessor.prototype.loadModules = function(){
	this.modules = module_loader.loadModules(GLOBAL["settings"].path.modules, this.module_loader_log);
	var processCommand = this.processCommand;
	var modules = this.modules;
	var log = this.log;

	for(var moduleName in this.modules){		
		modules[moduleName].on('command', function(args){
			if(args.hasOwnProperty('command')){
				log.write("Command received: "+ JSON.stringify(args), "", 3);
				processCommand(modules, args);
			}
		});
		
		modules[moduleName].on('request', function(args){
			if(args.hasOwnProperty('request') && args.hasOwnProperty('target')){
				log.write("Request received: "+ JSON.stringify(args), "", 3);
				processRequest(modules, args);
			}
		});
		modules[moduleName].init();
	}
}

CommandProcessor.prototype.processCommand = function(modules, args){
	for(var mName in modules) {
		if(moduleAcceptsCommand(modules[mName], args.command)){
			modules[mName].execCommand(args);
		}
	}
}

CommandProcessor.prototype.processRequest = function(modules, args){
	if(modules[args.target] != null){
		modules[args.target].execRequest(args);
	}
}

CommandProcessor.prototype.testCommand = function(commandArgs){
	this.processCommand(this.modules, commandArgs);
}

function moduleAcceptsCommand(module, command){
	return (module.acceptedCommands.indexOf(command) > -1)
}
