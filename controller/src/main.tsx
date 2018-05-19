import * as React from "react";
import * as ReactDOM from "react-dom";
import "./main.scss";
import RootView from "./views/RootView";

ReactDOM.render(<RootView />, document.getElementById("root"));

// type Loggable = string | number;

// // resolve web socket configuration
// const wsIp = localStorage.wsIp ? localStorage.wsIp : "127.0.0.1";
// const wsPort = 8000;
// const wsUrl = `ws://${wsIp}:${wsPort}`;

// let lastLogMessageTime = 0;
// let ws: WebSocket;

// // document.addEventListener(
// //   "DOMContentLoaded",
// //   () => {
// // log important info
// log("web socket url", wsUrl);

// // create a new websocket client
// ws = connect(wsUrl);
// //   },
// //   false,
// // );

// function connect(url: string): WebSocket {
//   log(`connecting to web-socket at ${url}`);

//   ws = new WebSocket(url);

//   let wasConnected = false;

//   ws.onopen = () => {
//     log("established web-socket connection");

//     wasConnected = true;
//   };

//   ws.onclose = () => {
//     if (wasConnected) {
//       log("connection to web-socket was lost");
//     } else {
//       log("connecting to web-socket failed");
//     }

//     setTimeout(() => {
//       ws = connect(url);
//     }, 1000);
//   };

//   ws.onmessage = event => {
//     log(`&lt ${event.data}`);
//   };

//   return ws;
// }

// export function log(...args: Loggable[]) {
//   const logWrap = document.getElementById("log");

//   if (logWrap === null) {
//     throw new Error("Log wrap could not be found");
//   }

//   const deltaTime = lastLogMessageTime > 0 ? Date.now() - lastLogMessageTime : 0;

//   logWrap.innerHTML += `[${pad(deltaTime, 5)}] `;

//   args.forEach((arg, index) => {
//     if (index > 0) {
//       logWrap.innerHTML += "  ";
//     }

//     logWrap.innerHTML += arg;
//   });

//   logWrap.innerHTML += "\n";

//   console.log.apply(console, args);

//   lastLogMessageTime = Date.now();
// }

// function send(message: string) {
//   ws.send(`${message}`);

//   log(`&gt ${message}`);
// }

// export function showToast(message: string) {
//   send(`!toast:${message}`);

//   log(`# ${message}`);
// }

// export function reload() {
//   send("!reload");
// }

// export function promptWebSocketIp() {
//   localStorage.wsIp = prompt("Enter web-socket ip");

//   reload();
// }

// function pad(value: string | number, padding: number) {
//   const str = typeof value === "string" ? value : value.toString();
//   const padLength = padding - str.length;

//   if (padLength < 1) {
//     return str;
//   }

//   return `${new Array(padLength + 1).join(" ")}${str}`;
// }
