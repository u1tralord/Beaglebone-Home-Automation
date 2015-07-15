var connect = require('connect');
var http = require('http');
var serveStatic = require('serve-static');
var fs = require('fs');
var path = require('path');
var module_name = path.basename(module.filename, path.extname(module.filename));

//pathToClient - path to the folder containing index.html and any 
//               additional web resources to be served
function WebServer(log, pathToClient){
	this.log = log;
	this.server = connect().use(serveStatic(pathToClient != null ? pathToClient : __dirname+"/client"));
}

WebServer.prototype.start = function(ip, port){
	this.server.listen(port);
	this.log.write("Server listening on port: " + port, "", 2);
	this.log.write("No IP passed to post server","warning", 4)
}

exports.get_web_server = function(log, pathToClient){
	return new WebServer(log, pathToClient);
}

//C:\Users\Jacob\AppData\Roaming\npm