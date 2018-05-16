"use strict";
var app = window.app;
// resolve web socket configuration
var wsIp = localStorage.wsIp ? localStorage.wsIp : "127.0.0.1";
var wsPort = 8000;
var wsUrl = "ws://" + wsIp + ":" + wsPort;
// resolve app configuration
var appIp = app.getIpAddress();
var appPort = 8080;
var appUrl = "http://" + appIp + ":" + appPort + "/";
// log important info
log("app url", appUrl);
log("web socket url", wsUrl);
// create a new websocket client
var ws = new WebSocket(wsUrl);
ws.onopen = function () {
    log("established WebSocket connection");
    send("hello from JavaScript!");
};
ws.onerror = function () {
    log("establishing WebSocket connection failed");
};
ws.onclose = function () {
    log("connection to WebSocket closed");
};
ws.onmessage = function (event) {
    log("&lt " + event.data);
};
function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var logWrap = document.getElementById("log");
    if (logWrap === null) {
        throw new Error("Log wrap could not be found");
    }
    args.forEach(function (arg, index) {
        if (index > 0) {
            logWrap.innerHTML += "  ";
        }
        logWrap.innerHTML += arg;
    });
    logWrap.innerHTML += "\n";
    console.log.apply(console, args);
}
function send(message) {
    ws.send(message);
    log("&gt " + message);
}
function showToast(message) {
    app.showToast(message);
    log("# " + message);
}
function reload() {
    log("reloading");
    app.reload();
}
function promptWebSocketIp() {
    localStorage.wsIp = prompt("Enter web-socket ip");
    reload();
}
//# sourceMappingURL=main.js.map