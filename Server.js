var connect = require('connect');
var serveStatic = require('serve-static');
var fs = require('fs');

var CONFIG_DIRECTORY = "config\\";

var loadConfig = function(config_file){
	return JSON.parse(fs.readFileSync('config\\'+ config_file, 'utf8'));
}

var validPath = function(path){
	var valid = true;
	
	try {
		stats = fs.lstatSync(path);
		if (stats.isDirectory()) { return true; }
		if (stats.isFile()) { return true; }
	}
	catch (e) {
		return false;
	}
	
	return valid;
}

var getFiles = function(path){
	var files = [];
	fs.readdir(path, function(err, files) {
		if (err) return;
		files.forEach(function(f) {
			//console.log('Files: ' + f);
			files.push(f);
		});
	});
	return files;
}

console.log(getFiles("config\\"));

var config = loadConfig("settings.config");
var pinMap = loadConfig("pinMap.config");

connect().use(serveStatic(__dirname+"/client")).listen(config.web.port);
console.log("Server started on port: " + config.web.port);