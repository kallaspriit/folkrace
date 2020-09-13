export const config = {
  clientVersion: process.env.REACT_APP_VERSION || "n/a",
  debug: process.env.NODE_ENV === "development",
  webSocket: {
    // allow overriding web-socket options via local storage
    host:
      // process.env.NODE_ENV === "development" &&
      localStorage.webSocketHost !== undefined ? localStorage.webSocketHost : "127.0.0.1",
    port: localStorage.webSocketPort !== undefined ? parseInt(localStorage.webSocketPort, 10) : 8000,
    useSSL: false,
    reconnectInterval: 3000,
  },
  rules: {
    battery: {
      low: 14.9,
      critical: 13.5,
      alarmInterval: 5000,
    },
  },
  vehicle: {
    trackWidth: 0.12, // meters
    maxSpeed: 1, // meters per second
    wheelDiameter: 0.039, // meters
    encoderCountsPerRotation: 20, // encoder pulse count per revolution
    gearboxRatio: 25, // 25/1 gearbox ratio
    speedUpdateInterval: 1000 / 100, // 100Hz
  },
};
