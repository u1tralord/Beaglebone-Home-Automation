http = require('http');
fs = require('fs');

port = 3000;
host = '192.168.1.11';
var password = "123";

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
	var command = args["command"];

	if(command == "ledControl")
		set_leds(args);
	if(command == "voiceCommand")
		process_voice_command(args);
	if(command == "foundSong")
		process_found_song(args);
	if(command == "downloadSong")
		process_download_music(args);
}

for (var key in args) {
	if (args.hasOwnProperty(key)){
		var value = args[key];
    }
}

var leds = {};
var set_leds = function(args){
	for (var key in args) {
		if (args.hasOwnProperty(key)){
			var value = args[key];
			if(value == "on") leds[key] = "on";
			if(value == "off") leds[key] = "off";

			if(value == "toggle"){
				if(leds[key] == "on") leds[key] = "off";
				else leds[key] = "on";
			}
		}
	}
}

var process_voice_command = function(args){
	console.log(args);
}

var process_found_song = function(args){
	var song = args["song"];
	var artist = args["artist"];
	var album = args["album"];
	console.log(song + " - " + artist + " : " + album);*/
}

var process_download_music = function(args){
	var song = args["song"];
	var artist = args["artist"];
	var album = args["album"];
	console.log(song + " - " + artist + " : " + album);
}

server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);