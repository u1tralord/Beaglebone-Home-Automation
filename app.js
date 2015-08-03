GLOBAL.ROOTDIR = __dirname;
GLOBAL.settings = JSON.parse(require('fs').readFileSync('config/settings.config', 'utf8'));

var moduleLoader = require('./core/moduleLoader.js');
var commandProcessor = require('./core/commandProcessor.js').prototype;
var logger = require('./core/logger.js');
var module = require('./core/module.js');

var path = require('path');
var events = require('events');
GLOBAL.core_log = logger.Log(path.join(GLOBAL["settings"].path.logs, "CORE.log"), "CORE_SERVER", 4);

moduleLoader.createRequiredDirectories();
commandProcessor.loadModules();

//commandProcessor.testCommand({command:'sendPush', deviceName:'LGG3', title:'TITLE!', body:'Oggly Boogly'});
/*
var modules = moduleLoader.loadModules();
*/


/*modules["myModule"].on('hello', function(){console.log('you emitted Hello!');});
modules["myModule"].init();
modules["myModule"].close();*/

//modules["pushbullet"].init();
//modules["pushbullet"].sendPush({command:'sendPush', deviceName:'LGG3', title:'TITLE!', body:'password:j9unf87ahs783h87hfio21m'});
//modules["pushbullet"].close();