var socket = io();

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

console.log(QueryString);
if(QueryString.devName)
	socket.emit('devName', {devName:QueryString.devName});

socket.on('streamVideo', function(data){
	console.log(data.url);
	if(data.url)
	{
		//"http://www.w3schools.com/html/mov_bbb.mp4"
		document.getElementById('videoElement').src = data.url;
		console.log(document.getElementById('videoElement').src);
		document.getElementById('videoElement').play();
	}
});
$("#test-button").click(function(){
	//var source = $('<source src="' + data.url + '" type="video/mp4">');
	//$('#videoElement').append(source);
	
	document.getElementById('videoElement').src = "http://www.w3schools.com/html/mov_bbb.mp4";
	console.log($("#videoElement").attr("src"));
	document.getElementById('videoElement').play();
});