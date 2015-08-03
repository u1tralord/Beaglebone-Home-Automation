var path = require('path');
var fs = require('fs');
require('util').inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.init = function(){
	this.music = [];
	this.videos = [];
	this.photos = [];
	
	loadMusic(function(){this.log.write('Music Loaded', '', 2)}.bind(this));
	loadVideos(function(){this.log.write('Videos Loaded', '', 2)}.bind(this));
	loadPhotos(function(){this.log.write('Photos Loaded', '', 2)}.bind(this));
}

module.exports.prototype.close = function(){
	this.running = false;
}

module.exports.prototype.streamAudio = function(commandArgs){
	var newCommandArgs = {};
	newCommandArgs.devName = commandArgs.devName;
	newCommandArgs.command = commandArgs.command;
	
	if(commandArgs.artist || commandArgs.album || commandArgs.track){
		newCommandArgs.audioURL = path.join(commandArgs.artist, commandArgs.album, commandArgs.track + '.mp3');
		this.emit('command', newCommandArgs);
	}
}

module.exports.prototype.loadMusic(done){
	this.music.length = 0;
	walk(this.settings.mediaPath.music, function(err, results) {
		if (err) throw err;
		var mp3_files = results.filter(function(fileName){
		  if(path.extname(fileName) == '.mp3') return true;
		});
		mp3_files.forEach(function(file){
			var musicObj = {url:file};
			
			//Get music data like track and artist and junk
			
			this.music.push(musicObj);
		}.bind(this));
		done();
	}.bind(this));
}
module.exports.prototype.loadVideos(done){
	this.videos.length = 0;
	walk(this.settings.mediaPath.videos, function(err, results) {
		if (err) throw err;
		var mp4_files = results.filter(function(fileName){
		  if(path.extname(fileName) == '.mp4') return true;
		});
		mp4_files.forEach(function(file){
			var videoObj = {url:file};
			
			//Get music data like track and artist and junk
			
			this.videos.push(videoObj);
		}.bind(this));
		done();
	}.bind(this));
}
module.exports.prototype.loadPhotos(done){
	this.photos.length = 0;
	walk(this.settings.mediaPath.photos, function(err, results) {
		if (err) throw err;
		var photo_files = results.filter(function(fileName){
		  if(path.extname(fileName) == '.jpg') return true;
		});
		photo_files.forEach(function(file){
			var photoObj = {url:file};
			
			//Get music data like track and artist and junk
			
			this.photos.push(photoObj);
		}.bind(this));
		done();
	}.bind(this));
}

function walk(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.join(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};