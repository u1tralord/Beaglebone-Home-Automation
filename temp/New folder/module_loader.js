var fs = require('fs');
var path = require('path');

var logger = require("./logger.js");

exports.loadConfig = function(config_name){
	var file_path = path.join(GLOBAL["settings"].path.configs, config_name, ".config");
	return JSON.parse(fs.readFileSync(file_path, 'utf8'));
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

exports.file_exists = function(path){
	var valid = false;
	try {
		stats = fs.lstatSync(path);
		if (stats.isFile()) { return true; }
	}
	catch (e) {
		return false;
	}
	return valid;
}