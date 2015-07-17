var events = require('events');
var util = require('util');
var http = require('http');
var fs = require('fs');

exports.createModule = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new PostServer(log, settings, moduleName);
	}
	else 
		throw new Error("Missing args to create module");
}

function PostServer(log, settings, moduleName){
	events.EventEmitter.call(this);
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	this.acceptedCommands = this.settings.acceptedCommands;
	
	this.server = http.createServer( function(req, res) {
	    //console.dir(req.param);
	    if (req.method == 'POST') {
	        //console.log("POST");
	        var body = '';
	        var post_data = '';
	        req.on('data', function (data) {
	            body += data;
	            
	            //Grab last line of post request (the line containing commands & args)
	            var post_args = parse_post_data(body.split(/\r?\n/)[6]);
	            log.write_time(JSON.stringify(post_args), "", 2);
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
	});
}
util.inherits(PostServer, events.EventEmitter);

PostServer.prototype.init = function(){
	var port = this.settings.port;
	var ip = this.settings.ip;

	this.server.listen(port, ip);
	this.log.write_time("Listening at  " + ip + ":" +port, "", 2);
	this.running = true;
}

PostServer.prototype.execCommand = function(commandArgs){
	if(running){
		this.log.write("Processing command: " + JSON.stringify(commandArgs), "", 1);
	}
}

PostServer.prototype.close = function(){
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