import config from "../config";
import { WebSocketClient } from "../lib/web-socket-client";

export const webSocketClient = new WebSocketClient({
  ...config.webSocket,
  log: console
});
