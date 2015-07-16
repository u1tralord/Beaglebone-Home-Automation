var path = require('path');

var module_loader = require('./module_loader.js');

var module_name = path.basename(module.filename, path.extname(module.filename));


exports.getCommandProcessor = function(log){
	return new CommandProcessor(log);
}

function CommandProcessor(log){
	this.log = log;
	this.modules = [];
}

CommandProcessor.prototype.loadModules = function(module_loader_log){
	this.modules = module_loader.load_modules(GLOBAL["settings"].path.modules, module_loader_log);

	//Modules need: 
	// * Command Emitter
	// * acceptedCommands []
	// * module_name
	// * init()
	// * execCommand()
	// * close()
	for(var module_name in this.modules){
		if(this.modules[module_name].commandEmitter != null){
			this.modules[module_name].commandEmitter.on('command', this.processCommand);
		}
	}
}

CommandProcessor.prototype.processCommand = function(args){
	this.log.write("GOTCHA!" + JSON.stringify(args));
}
