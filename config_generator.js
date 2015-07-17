var fs = require('fs');
var os = require('os');
var path = require('path');
var ifaces = os.networkInterfaces();

var getLocalIp = function(){
	var ip;
	Object.keys(ifaces).forEach(function (ifname) {
	  var alias = 0;

	  ifaces[ifname].forEach(function (iface) {
		// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		if ('IPv4' !== iface.family || iface.internal !== false) { return; }
		
		// this single interface has multiple ipv4 addresses
		if (alias >= 1) {} 
			//console.log(ifname + ':' + alias, iface.address);
		
		// this interface has only one ipv4 address
		else {}
			//console.log(ifname, iface.address);
			
		ip = iface.address;
	  });
	});
	return ip;
}

function dir_exists(path){
	try {
		stats = fs.lstatSync(path);
		if (stats.isDirectory()) { return true; }
	}
	catch (e) {
		return false;
	}
}

function generatePaths(paths){
	for (var path_name in paths) {
	if (paths.hasOwnProperty(path_name)){
		var path = paths[path_name];
		if(!dir_exists(path)){
			try {
				fs.mkdirSync(path);
			} catch(e) {
				if ( e.code != 'EEXIST' ) throw e;
			}
		}
		else
			console.log("Dir already exists");
	}
}
}

var saveConfig = function(filename, objectToSave){
	fs.writeFile(filename+".config", JSON.stringify(objectToSave), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Successfully Saved: " + filename);
}); 
}
////**************************************************************////
/***                     Edit Config Values Below                 ***/
/***      run: "node core/config.js" to generate the configs      ***/
////**************************************************************////

var account_info = JSON.parse(fs.readFileSync("account_info.config", 'utf8'));

//Basic server configuration
var settings = {};
settings.config_name = "settings";

settings.path = {};
settings.web = {};
settings.post = {};
settings.logger = {};

settings.path.client = path.join(__dirname, "client/");
settings.path.logs = path.join(__dirname, "logs/");
settings.path.configs = path.join(__dirname, "config/");
settings.path.modules = path.join(__dirname, "modules/");
generatePaths(settings.path);

settings.web.ip = getLocalIp();
settings.web.port = 8000;

settings.post.ip = getLocalIp();
settings.post.port = 4040;

settings.logger.log_level = 4;       // Lowest level of log entry allowed to be logged
settings.logger.error_level = 1;     // Priority level of errors caught
settings.logger.log_priority_level = false;

saveConfig(path.join(settings.path.configs, "/settings"), settings);


var post_server = {};
post_server.config_name = "post_server";
post_server.acceptedCommands = [];

post_server.ip = settings.post.ip || getLocalIp();
post_server.port = settings.post.port || 4040;

saveConfig(path.join(settings.path.configs, "post_server"), post_server);


var web_server = {};
web_server.config_name = "web_server";
web_server.acceptedCommands = [];

web_server.ip = settings.web.ip || getLocalIp();
web_server.port = settings.web.port || 8000;
web_server.clientPath = settings.path.client || './client/';

saveConfig(path.join(settings.path.configs, "web_server"), web_server);


//Value map for the pins and their keywords
/*
pinMap["led0"] = {       //Custom label to be used inside the program (Probably should avoid editing the default ones)
	pin:"USR0",          //Bonescript pin identifier
	output:true,         //true = output || false = input
	pwmEnabled: false,   //set to true to enable writing analog over pwm. False defaults to writeDigital()
	value:0              //default value to set when the server starts. Range:[0.0 - 1.0]
};
*/
var pin_control = {};
pin_control.config_name = "pin_control";
pin_control.update_rate = 1000/30;
pin_control.acceptedCommands = ["ledControl"];

pin_control.pin_map = {};
pin_control.pwm = ["P8_13", "P8_19", "P8_34", "P8_36", "P8_45", "P8_46", "P9_14", "P9_16", "P9_21", "P9_22", "P9_28", "P9_29", "P9_31", "P9_42"];
pin_control.pin_map["led0"] = {pin:"USR0", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["led1"] = {pin:"USR1", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["led2"] = {pin:"USR2", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["led3"] = {pin:"USR3", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["ledRed"] = {pin:"P9_14)", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["ledGreen"] = {pin:"P9_16", output:true, pwmEnabled: false, value:0};
pin_control.pin_map["ledBlue"] = {pin:"P9_22", output:true, pwmEnabled: false, value:0};
saveConfig(path.join(settings.path.configs, "pin_control"), pin_control);


var pushbullet = {};
pushbullet.config_name = "pushbullet";
pushbullet.acceptedCommands = ["sendPush"];

pushbullet.approved_users = ["ujy5M3deHjE"];
pushbullet.push_command_code = "$(9028)";

pushbullet.devices = {};
pushbullet.devices.LGG3 = "sjz5qsr8QGO";
pushbullet.devices.GS4 = "sjAiVsKnSTs";
pushbullet.devices.iPod5 = "sjz7O3P0J16";
pushbullet.devices.Chrome = "sjzWIEVDzOK";
pushbullet.devices.Firefox = "sjz0AKYrZV6";

pushbullet.API_key = account_info.pushbullet.API_key;
saveConfig(path.join(settings.path.configs, "pushbullet"), pushbullet);