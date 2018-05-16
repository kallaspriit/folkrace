type Loggable = string | number;

const app = window.app;

// resolve web socket configuration
const wsIp = localStorage.wsIp ? localStorage.wsIp : "127.0.0.1";
const wsPort = 8000;
const wsUrl = `ws://${wsIp}:${wsPort}`;

// resolve app configuration
const appIp = app.getIpAddress();
const appPort = 8080;
const appUrl = `http://${appIp}:${appPort}/`;

// log important info
log("app url", appUrl);
log("web socket url", wsUrl);

// create a new websocket client
let ws = new WebSocket(wsUrl);

ws.onopen = () => {
  log("established WebSocket connection");

  send("hello from JavaScript!");
};

ws.onerror = () => {
  log("establishing WebSocket connection failed");
};

ws.onclose = () => {
  log("connection to WebSocket closed");
};

ws.onmessage = event => {
  log(`&lt ${event.data}`);
};

function log(...args: Loggable[]) {
  const logWrap = document.getElementById("log");

  if (logWrap === null) {
    throw new Error("Log wrap could not be found");
  }

  args.forEach((arg, index) => {
    if (index > 0) {
      logWrap.innerHTML += "  ";
    }

    logWrap.innerHTML += arg;
  });

  logWrap.innerHTML += "\n";

  console.log.apply(console, args);
}

function send(message: string) {
  ws.send(message);

  log(`&gt ${message}`);
}

function showToast(message: string) {
  app.showToast(message);

  log(`# ${message}`);
}

function reload() {
  log(`reloading`);

  app.reload();
}

function promptWebSocketIp() {
  localStorage.wsIp = prompt("Enter web-socket ip");

  reload();
}
