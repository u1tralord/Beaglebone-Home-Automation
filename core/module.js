var events = require('events');

module.exports = function(){
	events.EventEmitter.call(this);
}
require('util').inherits(module.exports, events.EventEmitter);

module.exports.prototype.init = function(){this.running = true;}

module.exports.prototype.close = function(){this.running = false;}