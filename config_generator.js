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

settings.path.logs = path.join(__dirname, "logs/");
settings.path.configs = path.join(__dirname, "config/");
settings.path.modules = path.join(__dirname, "modules/");
settings.path.data = path.join(__dirname, "data/");
generatePaths(settings.path);

settings.ip = getLocalIp();

settings.logger.log_level = 4;       // Lowest level of log entry allowed to be logged
settings.logger.error_level = 1;     // Priority level of errors caught
settings.logger.log_priority_level = false;

saveConfig(path.join(settings.path.configs, "/settings"), settings);


var post_server = {};
post_server.config_name = "post_server";

post_server.ip = settings.ip;
post_server.port = 4040;

saveConfig(path.join(settings.path.configs, "post_server"), post_server);


var web_server = {};
web_server.config_name = "web_server";

web_server.ip = settings.ip;
web_server.port = 8000;
web_server.clientPath = 'client'; //Root folder containing html,css,js for website. 
                                  //This is in reference to the global settings.path.data

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

pin_control.pin_map = {};
pin_control.pwmAvailable = ["P8_13", "P8_19", "P8_34", "P8_36", "P8_45", "P8_46", "P9_14", "P9_16", "P9_21", "P9_22", "P9_28", "P9_29", "P9_31", "P9_42"];
pin_control.pin_map["USR0"] = {label:"led0", isOutput:true, value:0};
pin_control.pin_map["USR1"] = {label:"led1", isOutput:true, value:0};
pin_control.pin_map["USR2"] = {label:"led2", isOutput:true, value:0};
pin_control.pin_map["USR3"] = {label:"led3", isOutput:true, value:0};
pin_control.pin_map["P9_14"] = {label:"ledRed", isOutput:true, value:0.1};
pin_control.pin_map["P9_16"] = {label:"ledGreen", isOutput:true, value:0.1};
pin_control.pin_map["P9_22"] = {label:"ledBlue", isOutput:true, value:0.1};
saveConfig(path.join(settings.path.configs, "pin_control"), pin_control);

//
var pushbullet = {};
pushbullet.config_name = "pushbullet";

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


//
var forecast_weather = {};
forecast_weather.config_name = "forecast_weather";

//Twenty Minutes: 20 * (1000*60)
forecast_weather.update_rate = 20 * (1000*60);                      //in milliseconds
forecast_weather.timeout = 5000;                                    //in milliseconds
forecast_weather.API_key = account_info.forecastio.API_key;

forecast_weather.locations = {};
forecast_weather.locations.default = "Loganville";
forecast_weather.locations["Loganville"] = [33.837855, -83.901818];
forecast_weather.locations["Atlanta"] = [33.776509, -84.373152];
forecast_weather.locations["Lawrenceville"] = [33.956745, -83.988990];

saveConfig(path.join(settings.path.configs, "forecast_weather"), forecast_weather);


//
var voice = {};
voice.config_name = "voice";

voice.modules = [
	{
		moduleName:"pushbullet",
		commands:[
			{
				commandName:"sendPush",
				args:[
					{argFormat:"", valFormat:""}
				]
			},
		]
	},

	{
		moduleName:"pin_control",
		commands:[
			{
				commandName:"ledControl",
				args:[
					{argFormat:"led[%d,0:4]", valFormat:"[%d]"}
				]
			},
			{
				commandName:"setPinValue",
				args:[
					{argFormat:"p[%d,8:10]_[%d,0:24]", valFormat:"[%d]"}
				]
			},
		]
	},
	
	{
		moduleName:"forecast_weather",
		commands:[
			{
				commandName:"setLoc",
				args:[
					{argFormat:"", valFormat:""}
				]
			},
		]
	},
	
	{
		moduleName:"post_server",
		commands:[
			{
				commandName:"setPassword",
				args:[
					{argFormat:"", valFormat:""}
				]
			},
		]
	},
];

saveConfig(path.join(settings.path.configs, "voice"), voice);