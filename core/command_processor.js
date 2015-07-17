var path = require('path');

var module_loader = require('./module_loader.js');
var logger = require('./logger.js');

var module_name = path.basename(module.filename, path.extname(module.filename));


exports.getCommandProcessor = function(log){
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
		modules[moduleName].init();
	}
}

CommandProcessor.prototype.processCommand = function(modules, args){
	for(var mName in modules) {
		if(moduleAcceptsCommand(modules[mName], args.command)){
			modules[mName].execCommand(args);
		}
	}
	//if(moduleAcceptsCommand(modules[moduleName], args.command)){}
}

function moduleAcceptsCommand(module, command){
	return (module.acceptedCommands.indexOf(command) > -1)
}
