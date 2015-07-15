var fs = require('fs');
var os = require('os');
var LOG_LEVEL = 4; // Log Everything
var ERROR_LEVEL = 1; // How important are errors to log? 1 = critical. 4 = Don't bother 
var LOG_PRIORITY_LEVEL = false;
var LINE_LENGTH = 40;
//var LOG_LEVEL = 1; //Only log critical events

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

function get_indent(indent_count){
	var indent = "";
	for(var i = 0; i < indent_count; i++)
		indent += "  ";
	return indent;
}

function Log(path, module, log_level){
	this.indent = 0;
	this.path = path;
	this.module = module;
	this.log_level = log_level || LOG_LEVEL;
	this.writeStream = fs.createWriteStream(path, {'flags': 'a'});
	this.writeStream.write(getLine("Log Start"));
}

Log.prototype.write = function(message, module, priority){
	if(message != ""){
		var entry = get_indent(GLOBAL.core_log.indent) + "["+(module == "" ? this.module : this.module +" - " +module)  +"]" + (LOG_PRIORITY_LEVEL ? " [" + priority +"]" : "") + " - " + message;
		GLOBAL.core_log.addEntry(entry);
		
		if(priority <= this.log_level){
			console.log(entry);
			this.writeStream.write(entry + os.EOL);
		}
	}
};

Log.prototype.write_time = function(message, module, priority){
	if(message != ""){
		var entry = get_indent(GLOBAL.core_log.indent) + "("+getDateTime() + ") ["+(module == "" ? this.module : this.module +" - " +module)  +"]" + (LOG_PRIORITY_LEVEL ? " [" + priority +"]" : "") + " - " + message;
		GLOBAL.core_log.addEntry(entry);
		
		if(priority <= this.log_level){
			console.log(entry);
			this.writeStream.write(entry + os.EOL);
		}
	}
};

Log.prototype.write_err = function(message, module){
	this.write(message, module, ERROR_LEVEL);
};

Log.prototype.write_err_time = function(message, module){
	this.write_time(message, module, ERROR_LEVEL);
};

Log.prototype.start_task = function(message, module, priority){
	this.write(message + "...", module, priority);
	GLOBAL.core_log.indent++;
	this.indent++;
};

Log.prototype.start_task_time = function(message, module, priority){
	this.write_time(message + "...", module, priority);
	GLOBAL.core_log.indent++;
	this.indent++;
};

Log.prototype.end_task = function(message, module, priority){
	GLOBAL.core_log.indent--;
	this.indent--;
	this.write(message, module, priority);
};

Log.prototype.end_task_time = function(message, module, priority){
	GLOBAL.core_log.indent--;
	this.indent--;
	this.write_time(message, module, priority);
};

Log.prototype.addEntry = function(entry){
	this.writeStream.write(entry + os.EOL);
}

Log.prototype.close = function(message){
	this.writeStream.write(getLine(message))
	//this.writeStream.end();
};
	
exports.create_log = function(path, module, log_level){
	return new Log(path, module, log_level);
}

function getLine(message){
	var writeString = "*";
	if(message != null && message != ""){
		message = " " + message + " ";
		var extraSpace = LINE_LENGTH - message.length;

		for(var i = 0; i < extraSpace/2; i++){
			message += "-";
			writeString += "-"
		}
		writeString += message + "*";
	}
	else{
		for(var i = 0; i < LINE_LENGTH; i++){
			writeString += "-"
		}
		writeString += "*";
	}
	writeString+=os.EOL;
	return writeString;
}