var fs = require('fs');
var path = require('path');
var events = require('events');
var logger = require("./logger.js");

exports.dir_exists = function(path){
	var valid = false;
	try {
		stats = fs.lstatSync(path);
		if (stats.isDirectory()) { return true; }
	}
	catch (e) {
		return false;
	}
	return valid;
}
fileExists = function(path){
	try {
		stats = fs.lstatSync(path);
		if (stats.isFile()) { return true; }
	}
	catch (e) {
		return false;
	}
}

function loadConfig(config_name){
	var filePath = path.join(GLOBAL["settings"].path.configs, config_name + ".config");
	console.log()
	if(fileExists(filePath)) {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
	return null;
}

exports.load_json = function(path){
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

exports.get_files = function(path){
	return fs.readdirSync(path);
}

exports.load_configs = function(){
	this.get_files(GLOBAL["settings"].path.config).forEach(function(file){
		var config_temp;
		if(file.indexOf(".config") > -1){
			config_temp = load_json(GLOBAL["settings"].path.config + file);
			GLOBAL[config_temp.config_name] = config_temp;
		}
	});
}

function createModuleLog(moduleName){
	var moduleLog = logger.create_log(
		path.join(GLOBAL["settings"].path.logs, moduleName + ".log"), moduleName.toUpperCase() , 4
	);	
	return moduleLog;
}

function isModule(module){
	//Modules need: 
	// * module instanceof Command Emitter
	// * acceptedCommands []
	// * module_name
	// * init()
	// * execCommand()
	// * close()
	var validModule = true;
	
	if(typeof module.init != 'function'){
		module.log.write_err("Missing function: init()");
		validModule = false;
	}
	/////////////////////
	
	if(typeof module.execCommand != 'function'){
		module.log.write_err("Missing function: execCommand()");
		validModule = false;
	}
	////////////////////
	
	if(typeof module.execRequest != 'function'){
		module.log.write_err("Missing function: execRequest()");
		validModule = false;
	}
	////////////////////
	
	if(typeof module.close != 'function'){
		module.log.write_err("Missing function: close()");
		validModule = false;
	}
	////////////////////
	
	if(typeof module.moduleName != 'string'){
		module.log.write_err("Missing attribute: moduleName");
		validModule = false;
	}
	////////////////////
	
	if(typeof module.acceptedCommands != 'object'){
		module.log.write_err("Missing attribute: acceptedCommands");
		validModule = false;
	}
	/////////////////////
	
	if(!(module instanceof events.EventEmitter)){
		module.log.write_err("Not an instance of EventEmitter");
		validModule = false;
	}
	
	if(!validModule)
		module.log.write("See Module_Template.js for proper format", "", 2);
	
	return validModule;
}

exports.loadModules = function(module_dir, modLog){
	log = modLog;
	log.write("Module Dir: " + GLOBAL["settings"].path.modules, "", 2);
	log.write("Config Dir: " + GLOBAL["settings"].path.configs, "", 2);
	log.write("Log Dir: " + GLOBAL["settings"].path.logs, "", 2);
	var modules = {};
	
	log.start_task_time("Loading external modules", "", 2);
	fs.readdirSync(module_dir).forEach(function(file){
		if(file.indexOf(".js") > -1){
			var moduleName = file.replace(".js", "");
			log.start_task("Loading Module " + moduleName, "", 3);
			var moduleLoaded = false;
			
			var moduleFile = require(module_dir + file);
			if(typeof moduleFile.createModule == 'function')
			{
				log.write("Loading Module Config: " + moduleName + ".config", "", 3);
				var moduleSettings = loadConfig(moduleName);
				
				if(moduleSettings != null){
					log.write("Generating Module Log: " + moduleName + ".log", "", 3);
					var moduleLog = createModuleLog(moduleName);
					
					var module = moduleFile.createModule(moduleLog, moduleSettings, moduleName);
					if(isModule(module))
					{
						modules[moduleName] = module;
						moduleLoaded = true;
					}
				}
				else{
					log.write_err("Config not found for: " + file);
				}
			}
			if(moduleLoaded) log.end_task("Successfully loaded module", "", 3);
			else log.end_task("Module failed to load", "", 3);
		}
	});
	log.end_task_time("Modules finished loading", "", 2);
	
	return modules;
}
exports.load_modules = function(module_dir, mod_log){
	log = mod_log;
	log.start_task_time("Loading external modules", "", 2);
	log.write("Module Dir: " + GLOBAL["settings"].path.modules, "", 2);
	var modules = {};
	
	fs.readdirSync(module_dir).forEach(function(file){
		if(file.indexOf(".js") > -1){	
			var module_name = file.replace(".js", "");
			log.start_task("Loading Module " + module_name, "", 3);
			
			modules[module_name] = require(module_dir + file);

			//Check if module has "init()" function
			if(typeof modules[module_name].init == 'function'){
				log.write("Generating Module log: " + module_name + ".log", "", 3);
				
				var mod_log = logger.create_log(
					path.join(GLOBAL["settings"].path.logs, module_name + ".log"), module_name.toUpperCase() , 4
				);
				
				log.write("Calling " + module_name + ".init()", "", 2);
				
				log.start_task("","",4);
				modules[module_name].init(mod_log);
				log.end_task("","",4);
			}
			log.end_task("Module Loaded", "", 2);
		}
	});
	log.end_task_time("Modules successfully loaded", "", 2);
	return modules;
}