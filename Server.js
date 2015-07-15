//TODO:
// * To Do List API
// * Search Song Itunes
// * Download Songs 
// * Alarm Clock 
// * Serve videos and pictures
// 
// * Pushbullet API send password & new IP & new SSID
// * Create Pin Controller
// * Auto Load Modules 
// * Both Servers emit event to a command processer which selects a module

var path = require('path');

var logger = require('./core/logger.js');
var module_loader = require('./core/module_loader.js');
var ioserver = require('./core/IO_server.js');
//__filename, __dirname
var module_name = path.basename(module.filename, path.extname(module.filename));

GLOBAL["settings"] = module_loader.load_json("./config/settings.config");

var core_log = logger.create_log(
	path.join(__dirname, GLOBAL["settings"].path.logs, "CORE.log"), "CORE_SERVER", 4
);
var postServer_log = logger.create_log(
	path.join(__dirname, GLOBAL["settings"].path.logs, "POST_SERVER.log"),"POST_SERVER" , 4
);
var webServer_log = logger.create_log(
	path.join(__dirname, GLOBAL["settings"].path.logs, "WEB_SERVER.log"),"WEB_SERVER" , 4
);

var postServer = ioserver.createPostServer(postServer_log);
var webServer = ioserver.createWebServer(webServer_log, path.join(__dirname, GLOBAL["settings"].path.configs));

postServer.start(GLOBAL["settings"].post.ip, GLOBAL["settings"].post.port);
webServer.start(GLOBAL["settings"].web.ip, GLOBAL["settings"].web.port);

modules = module_loader.load_modules(path.join(__dirname, GLOBAL["settings"].path.modules));
console.log(modules);
/*
var io_log = logger.create_log("logs/io_server.log", "IO_SERVER", 4);
var io_server = ioserver.getIOServer(io_log, __dirname+"/client");
io_server.start(4040);
*/