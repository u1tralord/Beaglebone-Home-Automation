var path = require('path');
var fs = require('fs');
var id3 = require('id3js');
var natural = require('natural');
var util = require('util');
util.inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.init = function(){
	this.music = [];
	this.videos = [];
	this.photos = [];
	
	this.loadMusic(function(){
		this.log.write('Music Loaded', '', 2);
		fs.writeFile(path.join(this.dataDir, "MusicFileMap.json"), JSON.stringify(this.music), function(err) {console.log('saved')});
	}.bind(this));
	this.loadVideos(function(){this.log.write('Videos Loaded', '', 2)}.bind(this));
	this.loadPhotos(function(){this.log.write('Photos Loaded', '', 2)}.bind(this));
}

module.exports.prototype.close = function(){
	this.running = false;
}

module.exports.prototype.streamAudio = function(commandArgs){
	var newCommandArgs = {};
	newCommandArgs.devName = commandArgs.devName;
	newCommandArgs.command = commandArgs.command;

	if(commandArgs.artist || commandArgs.album || commandArgs.track){
		//newCommandArgs.audioURL = path.join(commandArgs.artist, commandArgs.album, commandArgs.track + '.mp3');
		newCommandArgs.audioURL = this.findSongURL(commandArgs.artist, commandArgs.album, commandArgs.track);
		
		if(newCommandArgs.audioURL)
			this.emit('command', newCommandArgs);
		else
			this.log.write('Song file not found!', '', 3);
	}
}
module.exports.prototype.findSongURL = function(artist, album, track){
	/*artistMatch = {artistName:"", matchValue:0};
	this.music.forEach(function(musicObj){
		var matchVal = natural.JaroWinklerDistance(artist,musicObj.artist);
		if(matchVal > artistMatch.matchValue)
		{
			artistMatch.matchValue = matchVal;
			artistMatch.artistName = musicObj.artist;
		}
	});*/
	var results = this.music;
	results = results.filter(function(musicObj){ return natural.JaroWinklerDistance(artist,musicObj.artist) > 0.6});
	if(results.length < 1)
		results = this.music;
	
	results = results.filter(function(musicObj){ return natural.JaroWinklerDistance(album,musicObj.album) > 0.6});
	if(results.length < 1)
		results = this.music;
	
	results = results.filter(function(musicObj){ return natural.JaroWinklerDistance(track,musicObj.track) > 0.6});
	
	//this.log.write(util.inspect(results), "", 4);
	if(results.length > 1){
		var bestMatchValue=0;
		var bestMatch = null;
		results.forEach(function(musicObj){
			var matchVal = natural.JaroWinklerDistance(track,musicObj.track);
			if(matchVal > bestMatchValue)
				bestMatch = musicObj;
		});
		this.log.write(util.inspect(bestMatch), "", 4);
		return bestMatch.url;
	}
	else if(results.length == 1){
		this.log.write(util.inspect(results[0]), "", 4);
		return results[0].url;
	}
	else{
		return null;
	}
	//console.log('BEST MATCH: ' + artistMatch.artistName + '- ' + artistMatch.matchValue );
}

module.exports.prototype.loadMusic = function(done){
	this.music.length = 0;
	walk(this.settings.mediaPath.music, function(err, results) {
		if (err) throw err;
		var mp3_files = results.filter(function(fileName){
		  if(path.extname(fileName) == '.mp3') return true;
		});

		var pending = mp3_files.length;
		mp3_files.forEach(function(filePath){
			var musicObj = {url:filePath};
			
			id3({ file:filePath, type: id3.OPEN_LOCAL }, function(err, tags) {
				//this.log.write(filePath, "", 4);
				if(tags)
				{
					musicObj.track = tags.title != null ? tags.title : "";
					musicObj.album = tags.album != null ? tags.album : "";
					musicObj.artist = tags.artist != null ? tags.artist : "";
					musicObj.year = tags.year != null ? tags.year : "";	
				}
				this.music.push(musicObj);
				pending--;
				if(pending <= 0)
					done();
			}.bind(this));
		}.bind(this));
	}.bind(this));
}
module.exports.prototype.loadVideos = function(done){
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
module.exports.prototype.loadPhotos = function(done){
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