export const config = {
  clientVersion: process.env.REACT_APP_VERSION || "n/a",
  debug: process.env.NODE_ENV === "development",
  websocket: {
    // allow overriding web-socket options via local storage
    host:
      // process.env.NODE_ENV === "development" &&
      localStorage.websocketHost !== undefined ? localStorage.websocketHost : "127.0.0.1",
    port: localStorage.websocketPort !== undefined ? parseInt(localStorage.websocketPort, 10) : 8000,
    useSSL: false,
    reconnectInterval: 3000,
  },
  battery: {
    low: 15.0,
    // critical: 13.9,
    // TODO: using higher threshold for testing
    critical: 14.5,
    alarmInterval: 5000,
  },
  vehicle: {
    trackWidth: 0.12, // meters
    maxSpeed: 1, // meters per second
    wheelDiameter: 0.039, // meters
    encoderCountsPerRotation: 20, // encoder pulse count per revolution
    gearboxRatio: 25, // 25/1 gearbox ratio
    speedUpdateInterval: 1000 / 60, // 60Hz
  },
  rates: {
    rcRate: 1.0,
    expoRate: 0.0,
    superRate: 0.7,
  },
  log: {
    ignoreSentCommands: ["s"],
    ignoreReceivedCommands: ["s", "t", "e", "h", "m", "v"],
  },
};
