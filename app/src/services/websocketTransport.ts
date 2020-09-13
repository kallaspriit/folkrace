import { config } from "../config";
import { WebsocketTransport } from "../lib/transport";

export const websocketTransport = new WebsocketTransport({
  ...config.webSocket,
  // log: console,
});
