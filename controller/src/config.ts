import { WebSocketClientOptions } from "./lib/web-socket-client/index";

export interface Config {
  webSocket: WebSocketClientOptions;
}

const config: Config = {
  webSocket: {
    // allow overriding web-socket options via local storage
    host: localStorage.webSocketHost !== undefined ? localStorage.webSocketHost : "127.0.0.1",
    port: localStorage.webSocketPort !== undefined ? parseInt(localStorage.webSocketPort, 10) : 8000,
  },
};

export default config;
