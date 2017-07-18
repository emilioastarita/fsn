"use strict";

const net = require('net');
const commander = require('commander');
const JsonSocket = require('json-socket');
const common = require('./common');
const log = common.log;
const program = new commander.Command("fsn-toucher");
const pkg = require("../package.json");
program.version(pkg.version);
program.option("-i, --ip [ip]", "Socket listener ip");
program.option("-p, --port", "[port] Socket listener port");
program.usage("[options] -- [script] [arguments]");
program.parse(process.argv);

let exec = require('child_process').exec;


const PORT = program.port || common.toucher.DEFAULT_PORT;
const IP = program.ip || common.toucher.DEFAULT_IP;

net.createServer(function (socket) {
    const sock = new JsonSocket(socket);
    log('CONNECTED: ' + socket.remoteAddress + ':' + socket.remotePort);
    sock.on('message', function (message) {
        log('Notified by: [' + socket.remoteAddress + ']: ');
        log(message.files.join("\n"));
        const cmd = 'touch -a -c ' + message.files.join(' ');
        exec(cmd, (error, stdout, stderr) => {
            error && log(stderr);
        });
    });
    sock.on('close', () => {
        log('CLOSED: ' + socket.remoteAddress + ' ' + socket.remotePort);
    });
}).listen(PORT, IP);

log('fsn-toucher server listening on ' + IP + ':' + PORT);

