var fs = require('fs');
var path = require('path');
var events = require('events');
var logger = require('./logger.js');

var log = logger.Log(
		path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.logs, "MODULE_LOADER.log"), 
		"MODULE_LOADER" , 
		4
	);

exports.loadModules = function(){
	var modules = {};
	var moduleDir = path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.modules);
	log.start_task_time("Loading external modules", "", 2);
	fs.readdirSync(moduleDir).forEach(function(fileName){
		var filePath = path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.modules, fileName)
		if(fileName.indexOf('.js') > -1 && fs.lstatSync(filePath).isFile()){ 
			var moduleName = moduleNameFromPath(fileName);
			log.start_task("Loading Module " + moduleName, "", 3);
			var module = this.loadModule(moduleName);
			
			if(module != null){
				log.end_task("Successfully loaded module", "", 3);
				modules[moduleName] = module;
			}
			else log.end_task("Module failed to load", "", 3);
		}
	}.bind(this));
	log.end_task_time("Modules finished loading", "", 2);
	return modules;
}

exports.loadModule = function(moduleName){
	var module = require(path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.modules, moduleName + ".js")).prototype;
	module.moduleName = moduleName;
	log.write("Loading Module Config: " + moduleName + ".config", "", 3);
	module.settings = this.loadConfig(moduleName);
	log.write("Generating Data Directory: /" + moduleName, "", 3);
	module.dataDir = this.loadDataDir(moduleName);
	log.write("Starting Module Log: " + moduleName + ".log", "", 3);
	module.log = this.loadLog(moduleName);
	
	if(isValidModule(module)) return module;
	
	return null;
}

exports.loadConfig = function(moduleName){
	var filePath = path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.configs, moduleName + ".config");
	if(fileExists(filePath)) {
		return JSON.parse(fs.readFileSync(filePath, 'utf8'));
	}
	return null;
}

exports.loadLog = function(moduleName){
	var moduleLog = logger.Log(
		path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.logs, moduleName + ".log"), 
		moduleName.toUpperCase() , 
		GLOBAL.settings.logger.log_level
	);	
	return moduleLog;
}

exports.loadDataDir = function(moduleName){
	var module_data_dir = path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.data, moduleName);
	makeDir(module_data_dir);
	return module_data_dir;
}

exports.createRequiredDirectories = function(){
	makeDir(path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.modules));
	makeDir(path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.logs));
	makeDir(path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.configs));
	makeDir(path.join(GLOBAL.ROOTDIR, GLOBAL.settings.path.data));
}

isValidModule = function(module){
		//Modules need: 
	// * module instanceof Command Emitter
	// * init()
	// * close()
	var validModule = true;
	
	if(typeof module.init != 'function'){
		module.log.write_err("Missing function: init()");
		validModule = false;
	}
	
	if(typeof module.close != 'function'){
		module.log.write_err("Missing function: close()");
		validModule = false;
	}
	
	if(module.settings == null){
		module.log.write_err("No settings config found for this module");
		validModule = false;
	}
	
	if(!(module instanceof events.EventEmitter)){
		module.log.write_err("Not an instance of EventEmitter");
		validModule = false;
	}
	
	if(!validModule)
		module.log.write("See Module_Template.js for proper format", "", 2);
	
	return validModule;
}

makeDir = function(dirPath){
	if(!dir_exists(dirPath)){
		try {
			fs.mkdirSync(dirPath);
		} catch(e) {
			if ( e.code != 'EEXIST' ) throw e;
		}
	}
}

dir_exists = function(dirPath){
	var valid = false;
	try {
		stats = fs.lstatSync(dirPath);
		if (stats.isDirectory()) { return true; }
	}
	catch (e) {
		return false;
	}
	return valid;
}
fileExists = function(filePath){
	try {
		stats = fs.lstatSync(filePath);
		if (stats.isFile()) { return true; }
	}
	catch (e) {
		console.log("FILE DOESNT EXIST");
		return false;
	}
}
moduleNameFromPath = function(filePath){
	return path.basename(filePath).replace('.js', '');
}