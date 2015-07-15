var http = require('http');
var path = require('path');
var module_name = path.basename(module.filename, path.extname(module.filename));

exports.create_server = function(log){
	return new PostServer(log);
}

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
	            parse_post_data(body.split(/\r?\n/)[6]);
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
	this.log.write("Server listening on port: " + port, "", 2);
	this.log.write("No IP passed to post server","warning" , 4)
}