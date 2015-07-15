var bb = require('bonescript');

var r = 0;
var b = 0;
var g = 0;
bb.analogWrite('P9_14', 0, 2000, function(x){});
bb.analogWrite('P9_16', 0, 2000, function(x){});
bb.analogWrite('P9_21', 0, 2000, function(x){});

var toR = getRandomArbitrary(0, 255);
var toB = getRandomArbitrary(0, 255);
var toG = getRandomArbitrary(0, 255);

setInterval(function () {
    r = r < toR ? r + 1 : r - 1;
    b = b < toB ? b + 1 : b - 1;
    g = g < toG ? g + 1 : g - 1;
    
    calcR = (r/255 <= 1.0) ? 1-(r/255)*.2 : 0;
    calcB = (g/255 <= 1.0) ? 1-(g/255)*1 : 0;
    calcG = (b/255 <= 1.0) ? 1-(b/255)*.3 : 0;
    
    bb.analogWrite('P9_14', calcR, 2000, function(x){});
    bb.analogWrite('P9_16', calcB, 2000, function(x){});
    bb.analogWrite('P9_21', calcG, 2000, function(x){});
}, 20);

setInterval(function () {
    toR = getRandomArbitrary(0, 255);
    toB = getRandomArbitrary(0, 255);
    toG = getRandomArbitrary(0, 255);
}, 7000);


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
