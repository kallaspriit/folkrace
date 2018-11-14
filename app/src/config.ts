import { WebSocketClientOptions } from "./lib/web-socket-client/index";
import { TrackedVehicleOptions } from "./lib/tracked-vehicle-kinematics";

export interface RulesConfig {
  battery: {
    low: number;
    critical: number;
  };
}

export interface Config {
  webSocket: WebSocketClientOptions;
  rules: RulesConfig;
  vehicle: TrackedVehicleOptions;
}

const config: Config = {
  webSocket: {
    // allow overriding web-socket options via local storage
    host:
      localStorage.webSocketHost !== undefined
        ? localStorage.webSocketHost
        : "127.0.0.1",
    port:
      localStorage.webSocketPort !== undefined
        ? parseInt(localStorage.webSocketPort, 10)
        : 8000,
    useSSL: false,
    reconnectInterval: 3000
  },
  rules: {
    battery: {
      low: 15.0,
      critical: 13.5
    }
  },
  vehicle: {
    trackWidth: 0.15, // meters
    maxSpeed: 1, // meters per second
    wheelDiameter: 0.039, // meters
    encoderCountsPerRotation: 20, // encoder pulse count per revolution
    gearboxRatio: 25, // 25/1 gearbox ratio
    speedUpdateInterval: 50 // 20Hz
  }
};

export default config;
