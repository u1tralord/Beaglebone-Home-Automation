var events = require('events');
var util = require('util');
var http = require('http');
var fs = require('fs');
util.inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

var pushPassword;

module.exports.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;
	this.createServer();
	this.server.listen(port, ip);
	this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	this.running = true;
}

module.exports.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write("Processing request: " + JSON.stringify(commandArgs), "", 1);
	}
}

module.exports.prototype.close = function(){
	this.running = false;
	this.log.write_time("Server shutting down", "", 2);
	this.server.close();
	this.log.write_time("Server successfully closed", "", 2);
}

function parse_post_data(data){
	var args = {};
	//var args = new Array();
	if(data != null){
		data.split("&").forEach(function(arg){
			var key = arg.split("=")[0];
			var value = arg.split("=")[1];
			args[key] = value;
		});
	}
	return args;
}

module.exports.prototype.createServer = function(){
	var log = this.log;
	var self = this;
	this.server = http.createServer( function(req, res) {
	    //console.dir(req.param);
	    if (req.method == 'POST') {
	        //console.log("POST");
	        var body = '';
	        var post_data = '';
	        req.on('data', function (data) {
	            body += data;
	            
	            //Grab last line of post request (the line containing commands & args)
	            var postArgs = parse_post_data(body.split(/\r?\n/)[6]);
	            log.write_time(JSON.stringify(postArgs), "", 2);
				
				log.write("Password Received: " + postArgs.password, "", 4);
				log.write("Password on File: " + postArgs.password, "", 4);
				log.write("TODO: Verify Password!", "", 1);
				
	            self.emit('command', postArgs);
	        });
	        req.on('end', function () {
	            //console.log("Body: " + body);
	        });
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end('post received');
	    }
	    else
	    {
	        console.log("GET");
	        var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
	        //var html = fs.readFileSync('index.html');
	        res.writeHead(200, {'Content-Type': 'text/html'});
	        res.end(html);
	    }
	}.bind(this));
}

///////////////////////////////////RESPOND TO COMMANDS HERE: 
module.exports.prototype.setPassword = function(commandArgs){
	if(commandArgs.hasOwnProperty('password')){
		pushPassword = commandArgs.password;
		this.emit('command', {
			command:'sendPush',
			deviceName:'LGG3', 
			title:'TITLE!', 
			body:'password:'+commandArgs.password
		});
	}
}