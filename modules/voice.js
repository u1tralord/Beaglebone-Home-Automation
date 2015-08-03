var events = require('events');
var util = require('util');
var natural = require('natural');
util.inherits(module.exports, require(require('path').join(GLOBAL.ROOTDIR, 'core', 'module.js')));

module.exports.prototype.init = function(){
	var classifier = new natural.BayesClassifier();

	this.settings.modules.forEach(function(module){
		module.commands.forEach(function(commmand){

			classifier.addDocument(module.moduleName, commmand.commandName);
			classifier.addDocument(commmand.commandName, commmand.commandName);
			classifier.addDocument(splitCamelCase(commmand.commandName), commmand.commandName);
			commmand.args.forEach(function(arg){
				//console.log("[" + module.moduleName + "] " + commmand.commandName + " - " + removePlaceholderTags(arg.argFormat) + " : " + removePlaceholderTags(arg.valFormat));
				classifier.addDocument(removePlaceholderTags(arg.argFormat), commmand.commandName);
				classifier.addDocument(arg.argFormat, commmand.commandName);
				classifier.addDocument(removePlaceholderTags(arg.valFormat), commmand.commandName);
			});

		});
	});
	classifier.train();

	this.classifier = classifier;
	this.running = true;
}

module.exports.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write('Processing request: ' + JSON.stringify(commandArgs), '', 1);
	}
}

module.exports.prototype.close = function(){
	this.running = false;
	
}

function splitCamelCase(str){
	var words = [];

	var wordStart = 0;
	for (var i = 0, len = str.length; i < len; i++) {
		if(str[i] == str[i].toUpperCase()){
			words.push(str.substring(wordStart, i).toLowerCase());
			wordStart = i;
		}
		if(i == len-1)
			words.push(str.substring(wordStart, i+1).toLowerCase());
	}
	return words;
}

function removePlaceholderTags(str){
	var startPos = 0;
	var endPos = 0;
	while(startPos > -1 && endPos > -1){
		startPos = str.indexOf('['); 
		endPos = str.indexOf(']');
		str = str.replace(str.substring(startPos, endPos+1), '');
	}
	return str;
}

module.exports.prototype.processVoice = function(commandArgs){
	var classifier = this.classifier;

	this.log.write("YOU SAID: " + commandArgs.voiceText, "", 3);
	/*commandArgs.voiceText.split(' ').forEach(function(term){
		this.log.write(term + " : " + classifier.classify(term), "", 4);
	}.bind(this));*/
	
	this.log.write("OVERALL: " + classifier.classify(commandArgs.voiceText), "", 3);
}