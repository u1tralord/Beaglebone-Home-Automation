var events = require('events');
var util = require('util');
var natural = require('natural');

exports.Module = function(log, settings, moduleName){
	if(log != null && settings != null && moduleName != null){
		return new VoiceProcessor(log, settings, moduleName);
	}
	else 
		throw new Error('Missing args to create module');
}

function VoiceProcessor(log, settings, moduleName){
	events.EventEmitter.call(this);
	this.settings = settings;
	this.log = log;
	this.moduleName = moduleName;
	this.acceptedCommands = this.settings.acceptedCommands;
}
util.inherits(VoiceProcessor, events.EventEmitter);

VoiceProcessor.prototype.init = function(){
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

VoiceProcessor.prototype.execCommand = function(commandArgs){
	if(this.running){

		if(commandArgs.command == 'processVoice' && commandArgs.hasOwnProperty('voiceText'))
			this.processVoice(commandArgs);

		//this.log.write('Processing command: ' + JSON.stringify(commandArgs), '', 1);
	}
}

VoiceProcessor.prototype.execRequest = function(commandArgs){
	if(this.running){
		this.log.write('Processing request: ' + JSON.stringify(commandArgs), '', 1);
	}
}

VoiceProcessor.prototype.close = function(){
	this.running = false;
	
}

VoiceProcessor.prototype.processVoice = function(commandArgs){
	var classifier = this.classifier;

	this.log.write("YOU SAID: " + commandArgs.voiceText, "", 3);
	/*commandArgs.voiceText.split(' ').forEach(function(term){
		this.log.write(term + " : " + classifier.classify(term), "", 4);
	}.bind(this));*/
	
	this.log.write("OVERALL: " + classifier.classify(commandArgs.voiceText), "", 3);
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