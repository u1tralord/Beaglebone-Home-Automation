var fs = require('fs');
var path = require('path');
var events = require('events');
var logger = require("./logger.js");

dir_exists = function(path){
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
	var moduleLog = logger.Log(
		path.join(GLOBAL["settings"].path.logs, moduleName + ".log"), moduleName.toUpperCase() , 4
	);	
	return moduleLog;
}

function createModuleDataDir(moduleName){
	var module_data_dir = path.join(GLOBAL["settings"].path.data, moduleName);
	if(!dir_exists(module_data_dir)){
		try {
			fs.mkdirSync(module_data_dir);
		} catch(e) {
			if ( e.code != 'EEXIST' ) throw e;
		}
	}
	return module_data_dir;
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
	/////////////////////
	
	if(!(module instanceof events.EventEmitter)){
		module.log.write_err("Not an instance of EventEmitter");
		validModule = false;
	}
	
	if(!validModule)
		module.log.write("See Module_Template.js for proper format", "", 2);
	
	return validModule;
}

exports.loadModule = function(moduleName, modLog){
	
}

exports.loadModules = function(module_dir, modLog){
	log = modLog;
	log.write("Module Dir: " + GLOBAL["settings"].path.modules, "", 2);
	log.write("Config Dir: " + GLOBAL["settings"].path.configs, "", 2);
	log.write("Log Dir: " + GLOBAL["settings"].path.logs, "", 2);
	log.write("Data Dir: " + GLOBAL["settings"].path.data, "", 2);
	var modules = {};
	
	log.start_task_time("Loading external modules", "", 2);
	fs.readdirSync(module_dir).forEach(function(file){
		if(file.indexOf(".js") > -1){
			var moduleName = file.replace(".js", "");
			log.start_task("Loading Module " + moduleName, "", 3);
			var moduleLoaded = false;
			
			var moduleFile = require(module_dir + file);
			if(typeof moduleFile.Module == 'function')
			{
				log.write("Loading Module Config: " + moduleName + ".config", "", 3);
				var moduleSettings = loadConfig(moduleName);
				
				if(moduleSettings != null){
					log.write("Generating Module Log: " + moduleName + ".log", "", 3);
					var moduleLog = createModuleLog(moduleName);
					
						
					var module = moduleFile.Module(moduleLog, moduleSettings, moduleName);
					if(isModule(module))
					{
						log.write("Generating Data Directory: " + moduleName + ".log", "", 3);
						module.data_dir = createModuleDataDir(moduleName);
					
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