var connect = require('connect');
var http = require('http');
var serveStatic = require('serve-static');
var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');

var module_name = path.basename(module.filename, path.extname(module.filename));


exports.createWebServer = function(log, pathToClient){
	return new WebServer(log, pathToClient);
}

exports.createPostServer = function(log){
	return new PostServer(log);
}


//pathToClient - path to the folder containing index.html and any 
//               additional web resources to be served
function WebServer(log, pathToClient){
	this.log = log;
	this.server = connect().use(serveStatic(pathToClient != null ? pathToClient : __dirname+"/client"));
}

WebServer.prototype.start = function(ip, port){
	this.server.listen(port);
	this.log.write_time("Server listening at  " + ip + ":" +port, "", 2);
}

WebServer.prototype.close = function(){
	this.log.write_time("Server shutting down", "", 2);
	this.server.close();
	this.log.write_time("Server successfully closed", "", 2);
}


/*************************************************************************/
/*///////////////////////////////////////////////////////////////////////*/
/*///////////////////////////////////////////////////////////////////////*/
/*///////////////////////////////////////////////////////////////////////*/
/*************************************************************************/

function PostServer(log){
	this.log = log;
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

PostServer.prototype.start = function(ip, port){
	this.server.listen(port);
	this.log.write_time("Server listening at  " + ip + ":" +port, "", 2);
}

PostServer.prototype.close = function(){
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



// 
// Broken and Useless at the Moment
// It was supposed to combine both WebServer and PostServer
// It provides a web page fine, but post requests from tasker do not work.
//
// Issues Here: 
// Tasker post requests show up as massive headers with an empty body
//
exports.getIOServer = function(log, pathToClient){
	return new IOServer(log, pathToClient);
}

function IOServer(log, pathToClient){
	this.log = log;
	var app = express();
	app.use(
        "/", //the URL throught which you want to access to you static content
        express.static(pathToClient) //where your static content is located in your filesystem
    );
    app.use(bodyParser.urlencoded({
	    extended: true
	}));
	app.use(bodyParser.json());

	app.get('/',function(request,response){
		console.log(request);
		response.end();
	});
	app.post('/', function(request,response){
		/*
		fs.writeFile("post_req.txt", request.body, function(err) {
		    if(err) {return console.log(err);}
		});*/
		console.log(request);
		console.log("POST");
		response.end();
	});
	this.server = http.Server(app);
}

IOServer.prototype.start = function(port){
	this.server.listen(port, function(){
	  console.log("Started on port: " + port);
	});
}