type Loggable = string | number;

const app = window.app;

// resolve web socket configuration
const wsIp = localStorage.wsIp ? localStorage.wsIp : "127.0.0.1";
const wsPort = 8000;
const wsUrl = `ws://${wsIp}:${wsPort}`;

// resolve app configuration
const appIp = app.getIpAddress();
const appPort = 8080;
const appUrl = `http://${appIp}:${appPort}`;

let lastLogMessageTime = 0;

// log important info
log("app url", appUrl);
log("web socket url", wsUrl);

// create a new websocket client
let ws = new WebSocket(wsUrl);

ws.onopen = () => {
  log("established WebSocket connection");
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

  const deltaTime = lastLogMessageTime > 0 ? Date.now() - lastLogMessageTime : 0;

  logWrap.innerHTML += `[${pad(deltaTime, 5)}] `;

  args.forEach((arg, index) => {
    if (index > 0) {
      logWrap.innerHTML += "  ";
    }

    logWrap.innerHTML += arg;
  });

  logWrap.innerHTML += "\n";

  console.log.apply(console, args);

  lastLogMessageTime = Date.now();
}

function send(message: string) {
  ws.send(`${message}\n`);

  log(`&gt ${message}`);
}

function showToast(message: string) {
  ws.send(`!toast:${message}`);

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

function pad(value: string | number, padding: number) {
  const str = typeof value === "string" ? value : value.toString();
  const padLength = padding - str.length;

  if (padLength < 1) {
    return str;
  }

  return `${new Array(padLength + 1).join(" ")}${str}`;
}
