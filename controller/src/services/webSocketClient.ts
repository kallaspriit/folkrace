import WebSocketClient from "../lib/web-socket-client";
import config from "../config";

const webSocketClient = new WebSocketClient({
  ...config.webSocket,
  log: console,
});

export default webSocketClient;
