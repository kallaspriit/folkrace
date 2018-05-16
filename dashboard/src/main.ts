type Loggable = string | number;

const app = window.app;
const ip = app.getIpAddress();
const port = 8000;
const wsUrl = `ws://${ip}:${port}`;

log("remote ip", ip);
log("port", port);
log("websocket url", wsUrl);

let ws = new WebSocket(wsUrl);

ws.onopen = () => {
  log("established WebSocket connection");

  showToast("Established WebSocket connection");

  send("hello from JavaScript!");
};

ws.onerror = () => {
  log("establishing WebSocket connection failed");

  showToast("Establishing WebSocket connection failed");
};

ws.onclose = () => {
  log("WebSocket connection closed");
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
