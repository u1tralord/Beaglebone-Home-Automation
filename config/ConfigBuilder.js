'use strict';

var fs = require('fs');
var os = require('os');
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
////**************************************************************////


//Base server configuration
var settings = {};
settings.web = {};
settings.post = {};
settings.web.ip = getLocalIp();
settings.post.ip = getLocalIp();
settings.web.port = 8080;
settings.post.port = 4040;
saveConfig("settings", settings);


//Value map for the pins and their keywords
/*
pinMap["led0"] = {       //Custom label to be used inside the program (Probably should avoid editing the default ones)
	pin:"USR0",          //Bonescript pin identifier
	output:true,         //true = output || false = input
	pwmEnabled: false,   //set to true to enable writing analog over pwm. False defaults to writeDigital()
	value:0              //default value to set when the server starts. Range:[0.0 - 1.0]
};
*/
var pinMap = {};
pinMap["led0"] = {pin:"USR0", output:true, pwmEnabled: false, value:0};
pinMap["led1"] = {pin:"USR1", output:true, pwmEnabled: false, value:0};
pinMap["led2"] = {pin:"USR2", output:true, pwmEnabled: false, value:0};
pinMap["led3"] = {pin:"USR3", output:true, pwmEnabled: false, value:0};
pinMap["ledRed"] = {pin:"P9_14)", output:true, pwmEnabled: false, value:0};
pinMap["ledGreen"] = {pin:"P9_16", output:true, pwmEnabled: false, value:0};
pinMap["ledBlue"] = {pin:"P9_22", output:true, pwmEnabled: false, value:0};
saveConfig("pinMap", pinMap);