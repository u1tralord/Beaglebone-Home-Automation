var path = require('path');
var util = require('util');
var module_loader = require('./moduleLoader.js');
var logger = require('./logger.js');

var log = logger.Log(
		path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.logs, "COMMAND_PROCESSOR.log"),
		"COMMAND_PROCESSOR", 
		4
	);
	
module.exports = function(){
	
}

module.exports.prototype.loadModules = function(){
	this.modules = module_loader.loadModules();
	var processCommand = this.processCommand;
	var modules = this.modules;

	for(var moduleName in this.modules){		
		modules[moduleName].on('command', function(args){
			if(args.hasOwnProperty('command')){
				log.write("Command received: "+ JSON.stringify(args), "", 3);
				processCommand(modules, args);
			}
		});
		modules[moduleName].init();
	}
	
	/*
	var moduleProps = [];
	for(m in require('./module.js').prototype)
		moduleProps.push(m);
	for(m in modules){
		console.log("MODULE: " + m);
		for(p in modules[m]){
			if(moduleProps.indexOf(p) == -1 && typeof modules[m][p] == 'function')
				console.log("  >: " + p);
		}
	}
	*/
}

module.exports.prototype.clearModules = function(){
	for(var moduleName in this.modules){
		//this.modules[moduleName].close();
		this.modules[moduleName] = null;
	}
}
module.exports.prototype.reloadModules = function(){
	this.clearModules();
	this.loadModules();
}
module.exports.prototype.stop = function(){
	this.clearModules();
	process.exit(0);
}

module.exports.prototype.processCommand = function(modules, args){
	for(var mName in modules) {
		if(moduleAcceptsCommand(modules[mName], args.command)){
			modules[mName][args.command](args);
		}
	}
}

module.exports.prototype.processRequest = function(modules, args){
	if(modules[args.target] != null){
		modules[args.target].execRequest(args);
	}
}

module.exports.prototype.testCommand = function(commandArgs){
	log.write('Testing command: ' + util.inspect(commandArgs), '', 3);
	this.processCommand(this.modules, commandArgs);
}

function moduleAcceptsCommand(module, command){
	return(typeof module[command] == 'function');
	//return (module.acceptedCommands.indexOf(command) > -1)
}
