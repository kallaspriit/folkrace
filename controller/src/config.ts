import { WebSocketClientOptions } from "./lib/web-socket-client/index";

export interface RulesConfig {
  battery: {
    low: number;
    critical: number;
  };
}

export interface Config {
  webSocket: WebSocketClientOptions;
  rules: RulesConfig;
}

const config: Config = {
  webSocket: {
    // allow overriding web-socket options via local storage
    host: localStorage.webSocketHost !== undefined ? localStorage.webSocketHost : "127.0.0.1",
    port: localStorage.webSocketPort !== undefined ? parseInt(localStorage.webSocketPort, 10) : 8000,
  },
  rules: {
    battery: {
      low: 15.0,
      critical: 13.5,
    },
  },
};

export default config;
