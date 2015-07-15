//http://stackoverflow.com/questions/11826384/calling-a-json-api-with-node-js
var qs = require("querystring");
var http = require("http");

var postData = qs.stringify({
  'term' : 'twenty+one+pilots'
});

var options = {
  hostname: 'itunes.apple.com',
  port: 80,
  path: '/search?',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': postData.length
  }
};

var req = http.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  var body;
  /*res.on('data', function (chunk) {
	 //console.log('BODY: ' + chunk.toString());
   data = chunk;
  });*/
  res.on('data', function (chunk) {
   //console.log('BODY: ' + chunk.toString());
    body+=chunk;
  });
  res.on('end', function(){
    console.log(body);
    JSON.parse(body);
  });
  //JSON.parse(data);
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(postData);
req.end();