// simple log listener function
export type LogListenerFn = (message: string) => void;

// list of registered log listeners
export const logListeners: LogListenerFn[] = [];

// registers a new log listener
export const addLogListener = (listener: LogListenerFn) => {
  logListeners.push(listener);
};

// global log function callable from anywhere, can be intercepted by any number of listeners
export const log = (message: string) =>
  logListeners.forEach(listener => listener(message));
