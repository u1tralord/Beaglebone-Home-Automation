var fs = require('fs');

exports.load_json = function(path){
	return JSON.parse(fs.readFileSync(path, 'utf8'));
}

exports.load_config = function(){
	get_files(GLOBAL["settings"].path.config).forEach(function(file){
		var config_temp;
		if(file.indexOf(".config") > -1){
			config_temp = load_json(GLOBAL["settings"].path.config + file);
			GLOBAL[config_temp.config_name] = config_temp;
		}
	});
}


//Module must include: init(log), 
exports.load_modules = function(module_dir){
	var modules = {};
	get_files(module_dir).forEach(function(file){
		if(file.indexOf(".js") > -1){
			var module_name = file.replace(".js", "");

			modules[module_name] = require("./" + module_dir + file);
			
			console.log("Module loaded: " + module_name);

			//Check if module has "init()" function
			if(typeof modules[module_name].init == 'function'){
				console.log("  Calling " + module_name + ".init()");
				modules[module_name].init();
			}
		}
	});
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

exports.get_files = function(path){
	return fs.readdirSync(path);
}