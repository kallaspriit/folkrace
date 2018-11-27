import config from "../config";
import { WebSocketClient } from "../lib/web-socket-client";

const webSocketClient = new WebSocketClient({
  ...config.webSocket,
  log: console
});

export default webSocketClient;
