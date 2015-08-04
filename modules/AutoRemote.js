exports.meta = {
    name: "AutoRemote",
    version: '0.0.1',
    enabled: true,
	publicCommands: ['sendRemoteMessage']
};

var request = require('request');
require('util').inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.sendRemoteMessage = function(commandArgs){
	if(commandArgs.deviceName && commandArgs.password && commandArgs.message)
	{	
		var messageOptions = {
			message:commandArgs.message
			//target:
			//sender:
			//ttl:
			//collapseKey:
		};
		
		if(this.settings.password && this.settings.password != "") 
			messageOptions.password = this.settings.password;
			
		var sendMessageUrl = this.getRemoteUrl('message', commandArgs.deviceName, messageOptions);
		if(sendMessageUrl){
			request({url:sendMessageUrl}, function(err, response, body) {
			  if(err) { console.log(err); return; }
			  if(response.statusCode == 200)
				  this.log.write('AutoRemote message successfully sent.', '', 3);
			}.bind(this));
		}
	}
}

module.exports.prototype.getRemoteUrl = function(type, deviceName, options){
	
	//Requires a deviceName, and message. All other options are not required
	if(type == 'message' && options.message){
		var key = this.settings.devices[deviceName];
		if(key)
		{
			var urlBase = this.settings.url + this.settings.sendMessagePath + 'key='+key;
			for(var optionKey in options){
				urlBase += '&'+optionKey+'='+options[optionKey];
			}
			return urlBase;
		}
	}
	if(type == 'notification' && options.password){
		
	}
}