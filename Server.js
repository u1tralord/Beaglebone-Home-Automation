//TODO:
// * To Do List API
// * Search Song Itunes
// * Download Songs 
// * Alarm Clock 
// * Serve videos and pictures
// 
// * Pushbullet API send password & new IP & new SSID
// * CHECK PUSHBULLET SENDER ID BEFORE DOING ANYHTING
// * Create Pin Controller
// * Auto Load Modules 
// * Both Servers emit event to a command processer which selects a module

var path = require('path');

var logger = require('./core/logger.js');
var module_loader = require('./core/module_loader.js');
var command_processor = require('./core/command_processor.js');

var module_name = path.basename(module.filename, path.extname(module.filename));
GLOBAL["settings"] = module_loader.load_json("./config/settings.config");
GLOBAL["settings"].root_dir = __dirname;

GLOBAL.core_log = logger.create_log(
	path.join(GLOBAL["settings"].path.logs, "CORE.log"), "CORE_SERVER", 4
);

var server_log = logger.create_log(
	path.join(GLOBAL["settings"].path.logs, "SERVER.log"), "SERVER" , 4
);
var commandProcessor_log = logger.create_log(
	path.join(GLOBAL["settings"].path.logs, "COMMAND_PROCESSOR.log"),"COMMAND_PROCESSOR" , 4
);

//var postServer = ioserver.createPostServer(postServer_log);
//var webServer = ioserver.createWebServer(webServer_log, GLOBAL["settings"].path.client);
var commandProcessor = command_processor.getCommandProcessor(commandProcessor_log);

//postServer.start(GLOBAL["settings"].post.ip, GLOBAL["settings"].post.port);
//webServer.start(GLOBAL["settings"].web.ip, GLOBAL["settings"].web.port);

commandProcessor.loadModules();
//modules = module_loader.load_modules(GLOBAL["settings"].path.modules, module_loader_log);

/*
var io_log = logger.create_log("logs/io_server.log", "IO_SERVER", 4);
var io_server = ioserver.getIOServer(io_log, __dirname+"/client");
io_server.start(4040);
*/