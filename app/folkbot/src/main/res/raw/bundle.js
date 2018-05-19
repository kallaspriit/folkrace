/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main.scss":
/*!***********************!*\
  !*** ./src/main.scss ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("// extracted by mini-css-extract-plugin\n\n//# sourceURL=webpack:///./src/main.scss?");

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n// import hyperHTML from \"hyperhtml\";\r\n__webpack_require__(/*! ./main.scss */ \"./src/main.scss\");\r\nvar menu_1 = __webpack_require__(/*! ./menu */ \"./src/menu.ts\");\r\nconsole.log(menu_1.default, 2);\r\n// resolve web socket configuration\r\nvar wsIp = localStorage.wsIp ? localStorage.wsIp : \"127.0.0.1\";\r\nvar wsPort = 8000;\r\nvar wsUrl = \"ws://\" + wsIp + \":\" + wsPort;\r\nvar lastLogMessageTime = 0;\r\n// log important info\r\nlog(\"web socket url\", wsUrl);\r\n// create a new websocket client\r\nvar ws = connect(wsUrl);\r\nfunction connect(url) {\r\n    log(\"connecting to web-socket at \" + url);\r\n    ws = new WebSocket(url);\r\n    var wasConnected = false;\r\n    ws.onopen = function () {\r\n        log(\"established web-socket connection\");\r\n        wasConnected = true;\r\n    };\r\n    ws.onclose = function () {\r\n        if (wasConnected) {\r\n            log(\"connection to web-socket was lost\");\r\n        }\r\n        else {\r\n            log(\"connecting to web-socket failed\");\r\n        }\r\n        setTimeout(function () {\r\n            ws = connect(url);\r\n        }, 1000);\r\n    };\r\n    ws.onmessage = function (event) {\r\n        log(\"&lt \" + event.data);\r\n    };\r\n    return ws;\r\n}\r\nfunction log() {\r\n    var args = [];\r\n    for (var _i = 0; _i < arguments.length; _i++) {\r\n        args[_i] = arguments[_i];\r\n    }\r\n    var logWrap = document.getElementById(\"log\");\r\n    if (logWrap === null) {\r\n        throw new Error(\"Log wrap could not be found\");\r\n    }\r\n    var deltaTime = lastLogMessageTime > 0 ? Date.now() - lastLogMessageTime : 0;\r\n    logWrap.innerHTML += \"[\" + pad(deltaTime, 5) + \"] \";\r\n    args.forEach(function (arg, index) {\r\n        if (index > 0) {\r\n            logWrap.innerHTML += \"  \";\r\n        }\r\n        logWrap.innerHTML += arg;\r\n    });\r\n    logWrap.innerHTML += \"\\n\";\r\n    console.log.apply(console, args);\r\n    lastLogMessageTime = Date.now();\r\n}\r\nexports.log = log;\r\nfunction send(message) {\r\n    ws.send(\"\" + message);\r\n    log(\"&gt \" + message);\r\n}\r\nfunction showToast(message) {\r\n    send(\"!toast:\" + message);\r\n    log(\"# \" + message);\r\n}\r\nexports.showToast = showToast;\r\nfunction reload() {\r\n    send(\"!reload\");\r\n}\r\nexports.reload = reload;\r\nfunction promptWebSocketIp() {\r\n    localStorage.wsIp = prompt(\"Enter web-socket ip\");\r\n    reload();\r\n}\r\nexports.promptWebSocketIp = promptWebSocketIp;\r\nfunction pad(value, padding) {\r\n    var str = typeof value === \"string\" ? value : value.toString();\r\n    var padLength = padding - str.length;\r\n    if (padLength < 1) {\r\n        return str;\r\n    }\r\n    return \"\" + new Array(padLength + 1).join(\" \") + str;\r\n}\r\n// const root = document.getElementById(\"root\");\r\n// if (root === null) {\r\n//   throw new Error(\"Root element #root not found\");\r\n// }\r\n// setInterval(menu, 1000, hyperHTML(root));\r\n\n\n//# sourceURL=webpack:///./src/main.ts?");

/***/ }),

/***/ "./src/menu.ts":
/*!*********************!*\
  !*** ./src/menu.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n// // this is hyperHTML\r\n// // tslint:disable-next-line:no-any\r\n// export default function menu(render: any) {\r\n//   // tslint:disable-next-line:no-unused-expression\r\n//   render`\r\n//     <div>\r\n//       <h1>Hello, world!</h1>\r\n//       <h2>It is ${new Date().toLocaleTimeString()}.</h2>\r\n//     </div>\r\n//   `;\r\n// }\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.default = \"Hello!\";\r\n\n\n//# sourceURL=webpack:///./src/menu.ts?");

/***/ })

/******/ });