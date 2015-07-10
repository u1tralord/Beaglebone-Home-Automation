http = require('http');
fs = require('fs');
server = http.createServer( function(req, res) {

    //console.dir(req.param);

    if (req.method == 'POST') {
        //console.log("POST");
        var body = '';
        var post_data = '';
        req.on('data', function (data) {
            body += data;
            //console.log("Partial body: " + body);
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
        var html = fs.readFileSync('index.html');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    }

});

var parse_post_data = function(data){
	var keys = [];
	var values = [];
	var args = new Array();

	if(data != null){
		data.split("&").forEach(function(arg){
			//console.log(arg);
			var key = arg.split("=")[0];
			var value = arg.split("=")[1];
			/*keys.push(key.replace("+", "_").replace(" ", "_"));
			values.push(value);*/
			args[key] = value;
		});
	}
	process_args(args)
	//console.log(args);
	/*
	for (var key in args) {
		if (args.hasOwnProperty(key))
	    	console.log("["+key+"] = " + args[key]);
	}
	*/
}

var process_args = function(args){
	var ledChanged = false;
	for (var key in args) {
		if (args.hasOwnProperty(key)){
	    	var value = args[key];
	    	if(key.indexOf("led") > -1)
	    	{
	    		set_led(key, value);
	    		ledChanged = true;
	    	}
	    	if(key.indexOf("command") > -1)
	    	{
	    		process_command(key, value);
	    	}
	    	if(key.indexOf("foundSong") > -1)
	    	{
	    		process_found_song(key, value);
	    	}
			if(key.indexOf("downloadSong") > -1)
	    	{
	    		process_download_song(key, value);
	    	}
	    }
	}
	if(ledChanged)
		console.log(leds);
}

var leds = {};
var set_led = function(key, value){
	if(value == "on") leds[key] = "on";
	if(value == "off") leds[key] = "off";

	if(value == "toggle"){
		if(leds[key] == "on") leds[key] = "off";
		else leds[key] = "on";
	}
}

var process_command = function(key, value){
	console.log(value);
}

var process_found_song = function(key, value){
	var songSplit = value.split(":");
	var song = songSplit[0].trim();
	var artist = songSplit[1].trim();
	var album = songSplit[2].trim();
	
	
	console.log(song + " - " + artist + " : " + album);
}

var process_download_music = function(key, value){

	
	console.log(song + " - " + artist + " : " + album);
}

port = 3000;
//host = '127.0.0.1';
host = '192.168.1.11';
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);