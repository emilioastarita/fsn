"use strict";
const fs = require("fs");
const path = require('path');
const net = require('net');
const commander = require('commander');
const chokidar = require('chokidar');
const JsonSocket = require('json-socket');
const common = require('./common');
const log = common.log;
const program = new commander.Command("fsn-toucher");
const pkg = require("../package.json");


program.version(pkg.version);
program.usage('[options] <watch-dir> [remote-dir]');
program.option("-i, --ip [ip]", "Toucher server ip to notify");
program.option("-p, --port [port]", "Toucher server port to notify");
program.option("--ignore <patterns>", "<patterns> Ignored patterns separated by ,", (patterns) => {
    return patterns.split(',').map(v => new RegExp(v));
});


program.parse(process.argv);

if (program.args.length > 2 || program.args.length <= 0) {
    program.help();
    process.exit(1);
}


const WATCH_DIR = program.args[0];
const REMOTE_DIR = program.args[1];
const PORT = program.port || common.toucher.DEFAULT_PORT;
const IP = program.ip || common.toucher.DEFAULT_IP;
const IGNORE_PATTERNS = program.ignore || common.watcher.DEFAULT_IGNORE_PATTERNS;
const HOST_STRING = IP + ':' + PORT;
let CURRENT_FILES = [];
let client = null;
let timeout = null;


startWatching();


function validateDir() {
    try {
        fs.lstatSync(WATCH_DIR).isDirectory()
    } catch (e) {
        if (e.code === 'ENOENT') {
            log('Watch directory:', WATCH_DIR, 'not exists');
            process.exit(1);
        }
        throw  e;
    }
}

function handleReconnection() {
    client = null;
    timeout && clearTimeout(timeout);
    timeout = setTimeout(makeClient, 2000);
}

function makeClient() {
    log('Trying connection:', HOST_STRING);
    client = new JsonSocket(new net.Socket());
    client.connect(PORT, IP, function () {
        log('Connected: ', HOST_STRING);
        log('Waiting for file changes');
    });
    client.on('close', handleReconnection);
    client.on('error', handleReconnection);
}

function notifyCurrentFiles() {
    log('Notify current files', CURRENT_FILES);
    client && client.sendMessage({files: CURRENT_FILES});
    CURRENT_FILES = [];
}

function startWatching() {
    validateDir();
    log('');
    log('Remote toucher:', HOST_STRING);
    log('Remote dir:', REMOTE_DIR || '-');
    log('Watch dir:', WATCH_DIR);
    log('Ignored patterns: ', IGNORE_PATTERNS.join(' '));
    log('');
    const notify = common.debounce(notifyCurrentFiles, common.DEBOUNCE_TIME);
    makeClient();
    chokidar.watch(WATCH_DIR, {
        persistent: true,
        ignoreInitial: true,
        ignored: IGNORE_PATTERNS
    }).on('all', (event, filePath) => {
        // console.log('event', event);
        if (REMOTE_DIR) {
            filePath = path.join(REMOTE_DIR, path.relative(WATCH_DIR, filePath))
        }
        CURRENT_FILES.indexOf(filePath) === -1 && CURRENT_FILES.push(filePath);
        notify();
    }).on('error', (error) => {
        log('Error: ', error.code);
        if (error.code === 'ENOSPC') {
            log('Try increasing max_user_watches or use --ignore option.')
        }
        process.exit(1);
    });
}




