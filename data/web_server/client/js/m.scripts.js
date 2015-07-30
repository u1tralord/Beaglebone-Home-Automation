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

window.addEventListener('orientationchange', calculateTileSize);
calculateTileSize()

function calculateTileSize()
{
    var bodyWidth = $(".panel-body").first().width();
    var bodyHeight = $(".panel-body").first().height();
    var squareSize = 125;
    switch(window.orientation) 
    {  
        case -90:
        case 90:
            squareSize = (bodyHeight/2);
            break;
        default:
            squareSize = (bodyWidth/2);
            break; 
    }
    $(".tile").each(function(){
        $(this).width(squareSize);
        $(this).height(squareSize);
    });
}

$(".tab-nav").click(function() {
  $( ".panel-screen" ).each(function() {
    $( this ).removeClass( "active-panel" );
  });
  $("#"+$(this).attr('linkTo')).addClass("active-panel");
});