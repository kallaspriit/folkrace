import { config } from "../config";
import { WebsocketTransport } from "../lib/transport/WebsocketTransport";

export const websocketTransport = new WebsocketTransport({
  ...config.webSocket,
  // log: console
});
