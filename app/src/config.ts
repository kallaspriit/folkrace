// import { TrackedVehicleOptions } from "./lib/tracked-vehicle-kinematics";
// import { WebSocketClientOptions } from "./lib/web-socket-client/index";

// export interface RulesConfig {
//   battery: {
//     low: number;
//     critical: number;
//   };
// }

// export interface Config {
//   webSocket: WebSocketClientOptions;
//   rules: RulesConfig;
//   vehicle: TrackedVehicleOptions;
// }

export const config = {
  webSocket: {
    // allow overriding web-socket options via local storage
    host:
      // process.env.NODE_ENV === "development" &&
      localStorage.webSocketHost !== undefined
        ? localStorage.webSocketHost
        : // : "127.0.0.1",
          "192.168.1.133",
    port:
      localStorage.webSocketPort !== undefined
        ? parseInt(localStorage.webSocketPort, 10)
        : 8000,
    useSSL: false,
    reconnectInterval: 3000,
  },
  rules: {
    battery: {
      low: 15.0,
      critical: 13.5,
    },
  },
  vehicle: {
    trackWidth: 0.12, // meters
    maxSpeed: 1, // meters per second
    wheelDiameter: 0.039, // meters
    encoderCountsPerRotation: 20, // encoder pulse count per revolution
    gearboxRatio: 25, // 25/1 gearbox ratio
    speedUpdateInterval: 1000 / 20, // 20Hz
  },
};
