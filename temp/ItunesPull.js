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
  res.on('data', function (chunk) {
	console.log('BODY: ' + chunk.toString());
	//JSON.parse(chunk);
  });
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(postData);
req.end();