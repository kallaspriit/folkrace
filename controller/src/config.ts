export interface WebSocketConfig {
  host: string;
  port: number;
  useSSL: boolean;
}

export interface Config {
  webSocket: WebSocketConfig;
}

const config: Config = {
  webSocket: {
    // allow overriding web-socket options via local storage
    host: localStorage.webSocketHost !== undefined ? localStorage.webSocketHost : "127.0.0.1",
    port: localStorage.webSocketPort !== undefined ? parseInt(localStorage.webSocketPort, 10) : 8000,
    useSSL: localStorage.webSocketUseSSL !== undefined ? localStorage.webSocketUseSSL === "1" : false,
  },
};

export default config;
