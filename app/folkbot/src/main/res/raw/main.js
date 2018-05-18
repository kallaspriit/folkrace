"use strict";
var app = window.app;
// resolve web socket configuration
var wsIp = localStorage.wsIp ? localStorage.wsIp : "127.0.0.1";
var wsPort = 8000;
var wsUrl = "ws://" + wsIp + ":" + wsPort;
var lastLogMessageTime = 0;
// log important info
log("web socket url", wsUrl);
// create a new websocket client
var ws = connect(wsUrl);
function connect(url) {
    log("connecting to web-socket at " + url);
    ws = new WebSocket(url);
    var wasConnected = false;
    ws.onopen = function () {
        log("established web-socket connection");
        wasConnected = true;
    };
    ws.onclose = function () {
        if (wasConnected) {
            log("connection to web-socket was lost");
        }
        else {
            log("connecting to web-socket failed");
        }
        setTimeout(function () {
            ws = connect(url);
        }, 1000);
    };
    ws.onmessage = function (event) {
        log("&lt " + event.data);
    };
    return ws;
}
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var logWrap = document.getElementById("log");
    if (logWrap === null) {
        throw new Error("Log wrap could not be found");
    }
    var deltaTime = lastLogMessageTime > 0 ? Date.now() - lastLogMessageTime : 0;
    logWrap.innerHTML += "[" + pad(deltaTime, 5) + "] ";
    args.forEach(function (arg, index) {
        if (index > 0) {
            logWrap.innerHTML += "  ";
        }
        logWrap.innerHTML += arg;
    });
    logWrap.innerHTML += "\n";
    console.log.apply(console, args);
    lastLogMessageTime = Date.now();
}
function send(message) {
    ws.send("" + message);
    log("&gt " + message);
}
function showToast(message) {
    send("!toast:" + message);
    log("# " + message);
}
function reload() {
    send("!reload");
}
function promptWebSocketIp() {
    localStorage.wsIp = prompt("Enter web-socket ip");
    reload();
}
function pad(value, padding) {
    var str = typeof value === "string" ? value : value.toString();
    var padLength = padding - str.length;
    if (padLength < 1) {
        return str;
    }
    return "" + new Array(padLength + 1).join(" ") + str;
}
//# sourceMappingURL=main.js.map