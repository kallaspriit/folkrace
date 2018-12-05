(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{43:function(t,e,n){t.exports=n(65)},65:function(t,e,n){"use strict";n.r(e);var r,a,i=n(0),o=n(21),c=(n(48),n(3)),s=n(4),u=n(7),l=n(6),f=n(8),h=n(2),d=n(67),p=n(70),g=n(66),v=n(68),m=n(15),b=n(5),O=n(33),E=n(39),y=n(9);!function(t){t.START="START",t.LEFT="LEFT",t.RIGHT="RIGHT"}(r||(r={})),function(t){t.UNKNOWN="UNKNOWN",t.PRESSED="PRESSED",t.RELEASED="RELEASED"}(a||(a={}));var j,S=function(t){function e(){var t,n,i;Object(c.a)(this,e);for(var o=arguments.length,s=new Array(o),f=0;f<o;f++)s[f]=arguments[f];return(i=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(s)))).state=(n={},Object(y.a)(n,r.START,a.UNKNOWN),Object(y.a)(n,r.LEFT,a.UNKNOWN),Object(y.a)(n,r.RIGHT,a.UNKNOWN),n),i}return Object(f.a)(e,t),Object(s.a)(e,[{key:"setButtonState",value:function(t,e){return this.setState(Object(y.a)({},t,e))}}]),e}(b.a),N=n(13),k=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={isStarted:!1,isValid:!1,targetRpm:0,currentRpm:0,motorPwm:0},n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"update",value:function(t){return this.setState(Object(N.a)({},t))}}]),e}(b.a),w=n(20);!function(t){t.INFO="INFO",t.ERROR="ERROR",t.RX="RX",t.TX="TX"}(j||(j={}));var C,T,x,I,D=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={entries:[]},n.lastId=0,n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"addEntry",value:function(t){var e=this,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.setState(function(r){var a=e.state.entries.length>0?e.state.entries[e.state.entries.length-1]:null,i=e.resolveMessageType(t);if(null!==a&&n&&t===a.message)return{entries:Object(w.a)(r.entries.slice(0,e.state.entries.length-1)).concat([{id:(e.lastId++).toString(),time:new Date,message:t,type:i,count:a.count+1}])};for(var o=Object(w.a)(r.entries).concat([{id:(e.lastId++).toString(),time:new Date,message:t,type:i,count:1}]);o.length>200;)o.shift();return{entries:o}}).catch(function(t){return console.error(t)})}},{key:"clear",value:function(){this.setState({entries:[]}).catch(function(t){return console.error(t)})}},{key:"resolveMessageType",value:function(t){switch(t.substr(0,1)){case"<":return j.RX;case">":return j.TX;case"@":return j.ERROR;case"#":default:return j.INFO}}}]),e}(b.a),R=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={measurements:[]},n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"add",value:function(t){return this.setState({measurements:Object(w.a)(this.state.measurements).concat([t])})}}]),e}(b.a),A=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={left:0,right:0},n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"update",value:function(t,e){return this.setState({left:t,right:e})}}]),e}(b.a),L=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={targetSpeed:{left:0,right:0},current:{left:0,right:0}},n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"setTargetSpeed",value:function(t,e){return this.setState({targetSpeed:{left:t,right:e}})}},{key:"setCurrent",value:function(t,e){return this.setState({current:{left:t,right:e}})}}]),e}(b.a),M=n(34),U=n.n(M),B={webSocket:{host:void 0!==localStorage.webSocketHost?localStorage.webSocketHost:"127.0.0.1",port:void 0!==localStorage.webSocketPort?parseInt(localStorage.webSocketPort,10):8e3,useSSL:!1,reconnectInterval:3e3},rules:{battery:{low:15,critical:13.5}},vehicle:{trackWidth:.15,maxSpeed:1,wheelDiameter:.039,encoderCountsPerRotation:20,gearboxRatio:25,speedUpdateInterval:50}};!function(t){t.DISCONNECTED="DISCONNECTED",t.CONNECTING="CONNECTING",t.RECONNECTING="RECONNECTING",t.CONNECTED="CONNECTED"}(C||(C={})),function(t){t.USB="usb",t.BLUETOOTH="bluetooth"}(T||(T={})),function(t){t.CONNECTING="CONNECTING",t.CONNECTED="CONNECTED",t.DISCONNECTED="DISCONNECTED",t.NOT_SUPPORTED="NOT_SUPPORTED",t.DEVICE_NOT_FOUND="DEVICE_NOT_FOUND",t.DISABLED="DISABLED"}(x||(x={})),function(t){t.UNKNOWN="UNKNOWN",t.FULL="FULL",t.LOW="LOW",t.CRITICAL="CRITICAL"}(I||(I={}));var G=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).state={serials:{BLUETOOTH:{type:T.BLUETOOTH,state:x.DISCONNECTED,deviceName:void 0},USB:{type:T.USB,state:x.DISCONNECTED,deviceName:void 0}},transportState:C.DISCONNECTED},n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"setSerialState",value:function(t,e,n){var r=Object.keys(T).find(function(e){return T[e]===t});return this.setState(U()(this.state,{serials:Object(y.a)({},r,{$merge:{state:e,deviceName:n}})}))}},{key:"setTransportState",value:function(t){return this.setState({transportState:t})}},{key:"setBatteryVoltage",value:function(t){return this.setState({batteryVoltage:t})}},{key:"setRemoteIp",value:function(t){return this.setState({remoteIp:t})}},{key:"setOffline",value:function(){return this.setState({remoteIp:void 0})}},{key:"setLoopStatistics",value:function(t,e){return this.setState({lastBeaconTime:new Date,loopFrequency:t,loopTimeUs:e})}},{key:"setResetReceived",value:function(){return this.setState({lastResetTime:new Date})}},{key:"getConnectedSerial",value:function(){var t=this;return Object.keys(this.state.serials).map(function(e){return t.state.serials[e]}).find(function(t){return t.state===x.CONNECTED})}},{key:"batteryState",get:function(){var t=this.state.batteryVoltage;return void 0===t?I.UNKNOWN:t<=B.rules.battery.critical?I.CRITICAL:t<=B.rules.battery.low?I.LOW:I.FULL}}]),e}(b.a);var F=function(){function t(e){Object(c.a)(this,t),this.transport=e}return Object(s.a)(t,[{key:"requestVoltage",value:function(){this.send("voltage")}},{key:"requestState",value:function(){this.send("state")}},{key:"setSpeed",value:function(t,e){this.send("s",t,e)}},{key:"ping",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.pingSentTime=Date.now(),t?this.send("!ping"):this.send("ping")}},{key:"send",value:function(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];var a="".concat(t).concat(n.length>0?":":"").concat(n.join(":"));this.transport.send(a)}}]),t}(),z=n(14),W=n.n(z),H=n(16),P=n(17),V=function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};Object(c.a)(this,t),this.listeners=[],this.transports=[],this.options=Object(N.a)({log:P.dummyLogger},e),this.log=this.options.log}return Object(s.a)(t,[{key:"getName",value:function(){var t=this.getActiveTransport();return t?t.getName():"None"}},{key:"isAvailable",value:function(){return void 0!==this.getAvailableTransport()}},{key:"getState",value:function(){var t=this.getActiveTransport();return t?t.getState():C.DISCONNECTED}},{key:"addListener",value:function(t){this.listeners.push(t)}},{key:"connect",value:function(){var t=Object(H.a)(W.a.mark(function t(){return W.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:this.transports.forEach(function(t){t.getState()===C.DISCONNECTED&&t.connect()});case 1:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"send",value:function(t){var e=this,n=this.getConnectedTransport();return n?n.send(t):(this.log.warn('sending message "'.concat(t,'" requested but there is no connected transport available')),this.listeners.forEach(function(n){return n.onMessageSent(e,t,!1)}),!1)}},{key:"addTransport",value:function(t){var e=this;t.addListener({onStateChanged:function(t,n,r){var a=e.getActiveTransport();t===a&&e.listeners.forEach(function(e){return e.onStateChanged(t,n,r)})},onError:function(t,n){var r=e.getActiveTransport();t===r&&e.listeners.forEach(function(e){return e.onError(t,n)})},onMessageSent:function(t,n,r){var a=e.getActiveTransport();t===a&&e.listeners.forEach(function(e){return e.onMessageSent(t,n,r)})},onMessageReceived:function(t,n){var r=e.getActiveTransport();t===r&&e.listeners.forEach(function(e){return e.onMessageReceived(t,n)})}}),this.transports.push(t)}},{key:"getAvailableTransport",value:function(){return this.transports.find(function(t){return t.isAvailable()})}},{key:"getConnectedTransport",value:function(){return this.transports.find(function(t){return t.getState()===C.CONNECTED})}},{key:"getActiveTransport",value:function(){var t=this.getConnectedTransport();return t||this.getAvailableTransport()}}]),t}(),q=new(function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};Object(c.a)(this,t),this.listeners=[],this.state=C.DISCONNECTED,this.options=Object(N.a)({log:P.dummyLogger},e),this.log=this.options.log,this.bridgeExists=void 0!==window.native}return Object(s.a)(t,[{key:"getName",value:function(){return"Native"}},{key:"isAvailable",value:function(){return this.bridgeExists}},{key:"getState",value:function(){return this.state}},{key:"addListener",value:function(t){this.listeners.push(t)}},{key:"connect",value:function(){var t=Object(H.a)(W.a.mark(function t(){var e=this;return W.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(this.setState(C.CONNECTING),void 0!==window.native){t.next=5;break}return this.log.info("no native bridge is available"),this.setState(C.DISCONNECTED),t.abrupt("return");case 5:this.log.info("native bridge is available"),this.native=window.native,window.app={receive:function(t){return e.onMessageReceived(t)}},this.setState(C.CONNECTED);case 9:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"send",value:function(t){var e=this;if(!this.native||this.state!==C.CONNECTED)return this.log.warn('sending message "'.concat(t,'" requested but the native bridge is not available')),this.listeners.forEach(function(n){return n.onMessageSent(e,t,!1)}),!1;try{return this.native.receive(t),this.listeners.forEach(function(n){return n.onMessageSent(e,t,!0)}),!0}catch(n){this.listeners.forEach(function(t){return t.onError(e,n)})}return!1}},{key:"setState",value:function(t){var e=this;if(t!==this.state){var n=this.state;this.state=t,this.listeners.forEach(function(r){return r.onStateChanged(e,t,n)})}}},{key:"onMessageReceived",value:function(t){var e=this;this.log.info('received: "'.concat(t,'"')),this.listeners.forEach(function(n){return n.onMessageReceived(e,t)})}}]),t}())({}),K=new(function(){function t(e){Object(c.a)(this,t),this.listeners=[],this.state=C.DISCONNECTED,this.wasConnected=!1,this.options=Object(N.a)({useSSL:!1,log:P.dummyLogger,reconnectInterval:1e3},e),this.log=this.options.log}return Object(s.a)(t,[{key:"getName",value:function(){return"WebSocket"}},{key:"isAvailable",value:function(){return void 0!==WebSocket}},{key:"getState",value:function(){return this.state}},{key:"addListener",value:function(t){this.listeners.push(t)}},{key:"connect",value:function(){var t=Object(H.a)(W.a.mark(function t(){var e,n=this;return W.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:e="".concat(this.options.useSSL?"wss":"ws","://").concat(this.options.host,":").concat(this.options.port),this.log.info("connecting to web-socket server at ".concat(e)),this.setState(this.wasConnected?C.RECONNECTING:C.CONNECTING),this.ws=new WebSocket(e),this.ws.onopen=function(t){n.log.info("established web-socket connection"),n.wasConnected=!0,n.setState(C.CONNECTED)},this.ws.onclose=function(t){var e="code: ".concat(t.code,", reason: ").concat(t.reason,", was clean: ").concat(t.wasClean?"yes":"no");n.wasConnected?n.log.warn("connection to web-socket was lost (".concat(e,")")):n.log.warn("connecting to web-socket failed (".concat(e,")")),n.setState(C.DISCONNECTED),setTimeout(function(){n.connect()},n.options.reconnectInterval)},this.ws.onerror=function(t){n.log.warn("got web-socket error"),n.listeners.forEach(function(t){return t.onError(n)})},this.ws.onmessage=function(t){var e=t.data;n.listeners.forEach(function(t){return t.onMessageReceived(n,e)})};case 8:case"end":return t.stop()}},t,this)}));return function(){return t.apply(this,arguments)}}()},{key:"send",value:function(t){var e=this;return this.ws&&this.state===C.CONNECTED?(this.ws.send(t),this.listeners.forEach(function(n){return n.onMessageSent(e,t,!0)}),!0):(this.log.warn('sending message "'.concat(t,'" requested but websocket state is ').concat(this.state)),this.listeners.forEach(function(n){return n.onMessageSent(e,t,!1)}),!1)}},{key:"setState",value:function(t){var e=this;if(t!==this.state){var n=this.state;this.state=t,this.listeners.forEach(function(r){return r.onStateChanged(e,t,n)})}}}]),t}())(Object(N.a)({},B.webSocket)),X=new V({});X.addTransport(q),X.addTransport(K);var _=new F(X);function J(){return(J=Object(H.a)(W.a.mark(function t(e,n){var r,a,i,o,c;return W.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=n.status,a=e[0],i=e[1],o="string"===typeof e[2]?e[2]:void 0,t.next=6,r.setSerialState(a,i,o);case 6:void 0!==(c=r.getConnectedSerial())&&a===c.type?_.requestState():r.setBatteryVoltage(void 0);case 8:case"end":return t.stop()}},t,this)}))).apply(this,arguments)}var Y={serial:function(t,e){return J.apply(this,arguments)},ip:function(t,e){var n=e.status,r=t[0];"null"===r?n.setOffline():n.setRemoteIp(r)},usb:function(t,e){var n=parseInt(t[0],10),r=parseInt(t[1],10),a=t[2];console.log("usb",{vendorId:n,productId:r,productName:a})},voltage:function(t,e){var n=e.status,r=parseFloat(t[0]);n.setBatteryVoltage(r)},button:function(t,e){var n=e.button,r=t[0],i=0===parseInt(t[1],10)?a.PRESSED:a.RELEASED;n.setButtonState(r.toUpperCase(),i)},reset:function(t,e){e.status.setResetReceived()},current:function(t,e){var n=e.robot,r=parseInt(t[0],10),a=parseInt(t[1],10);n.setCurrent(r,a)},lidar:function(t,e){var n=e.lidar,r=1===parseInt(t[0],10),a=1===parseInt(t[1],10),i=parseFloat(t[2]),o=parseFloat(t[3]),c=parseFloat(t[4]);n.update({isStarted:r,isValid:a,targetRpm:i,currentRpm:o,motorPwm:c})},pong:function(t,e){var n=e.log;if(_.pingSentTime){var r=Date.now()-_.pingSentTime;_.pingSentTime=void 0,n.addEntry("# ping: ".concat(r," ms"))}},e:function(t,e){var n=e.odometry,r=parseInt(t[0],10),a=parseInt(t[1],10);n.update(r,a)},b:function(t,e){var n=e.status,r=parseInt(t[0],10),a=parseInt(t[1],10),i=a/r*1e3,o=r/a*1e3;n.setLoopStatistics(i,o)},m:function(t,e){e.measurements.add({angle:parseInt(t[0],10),distance:parseInt(t[1],10),quality:parseInt(t[2],10),date:new Date})},s:function(t,e){var n=e.robot,r=parseInt(t[0],10),a=parseInt(t[1],10);n.setTargetSpeed(r,a)}};var $=[],Q=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).isInitialized=!1,n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"render",value:function(){var t=this;return i.createElement(b.c,{to:[D,G,A,k,S,L,R]},function(e,n,r,a,i,o,c){return t.isInitialized?null:(s=function(t){return e.addEntry(t)},$.push(s),n.setTransportState(X.getState()),X.addListener({onStateChanged:function(t,r,a){e.addEntry("# ".concat(t.getName()," state changed to ").concat(r)),n.setTransportState(r)},onError:function(t,n){e.addEntry("# transport error occurred".concat(n?" (".concat(n.message,")"):""))},onMessageSent:function(t,n,r){var a=n.split(":"),i=Object(E.a)(a,1)[0];1===i.length||["ping","!ping"].includes(i)||e.addEntry("> ".concat(n).concat(r?"":" (sending failed)"))},onMessageReceived:function(s,u){var l={log:e,status:n,odometry:r,lidar:a,button:i,robot:o,measurements:c};t.handleTransportMessage(u,l)}}),X.connect(),t.isInitialized=!0,null);var s})}},{key:"handleTransportMessage",value:function(t,e){if(0!==t.length){var n=t.split(":"),r=Object(O.a)(n),a=r[0],i=r.slice(1);a.length>1&&-1===["pong"].indexOf(a)&&e.log.addEntry("< ".concat(t)),function(t,e,n){var r=Y[t];void 0!==r?r(e,n):console.warn('missing web-socket command handler for "'.concat(t,'" (').concat(e.join(", "),")"))}(a,i,e)}}}]),e}(i.Component),Z=n(19),tt=n(69);function et(){var t=Object(h.a)(['\n  // main font\n  @font-face {\n    font-family: "heebo-regular";\n    src: url("fonts/Heebo-Regular.ttf");\n    font-weight: normal;\n    font-style: normal;\n  }\n\n  // default to using border box sizing\n  html {\n    box-sizing: border-box;\n  }\n  *,\n  *:before,\n  *:after {\n    box-sizing: inherit;\n  }\n\n  // set body styles\n  body,\n  html {\n    height: 100;\n    padding: 0;\n    margin: 0;\n    font-family: "heebo-regular";\n    color: ',";\n    background-color: ",";\n  }\n"]);return et=function(){return t},t}function nt(){var t=Object(h.a)(["\n      0% {\n        background: ",";\n      }\n      50% {\n        background: ",";\n      }\n      100% {\n        background: ",";\n      }\n    "]);return nt=function(){return t},t}function rt(){var t=Object(h.a)(["\n      from {\n        opacity: 0;\n      }\n      to {\n        opacity: 1;\n      }\n    "]);return rt=function(){return t},t}var at={text:{primary:"#f0f0f0",secondary:"#969696"},bg:{primary:"#cc3333",secondary:"#282828",tertiary:Object(Z.b)(.05,"#282828"),quaternary:"#087099",good:"#009900",warn:"#999900",bad:"#990000"},size:{darkerLighterPercentage:.25,gridGap:"2px",menuHeight:"64px"},animation:{fadeIn:Object(m.e)(rt()),pulse:function(t){return Object(m.e)(nt(),t,Object(Z.b)(.25,t),t)}}},it=m.d,ot=Object(m.b)(et(),at.text.primary,at.bg.secondary);function ct(){var t=Object(h.a)(["\n  display: block;\n  width: ","px;\n  height: ","px;\n  mask-image: url(",");\n  mask-size: ","px ","px;\n  mask-repeat: no-repeat;\n  mask-position: center center;\n  background-color: ",";\n"]);return ct=function(){return t},t}var st=it.i(ct(),function(t){return t.width},function(t){return t.height},function(t){return t.url},function(t){return t.height},function(t){return t.width},function(t){return t.theme.text.primary}),ut=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/status.svg",width:37,height:32}))},lt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/map.svg",width:32,height:32}))},ft=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/bot.svg",width:27,height:32}))},ht=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/remote.svg",width:44,height:32}))},dt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/settings.svg",width:32,height:32}))},pt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/bluetooth.svg",width:32,height:32}))},gt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/serial.svg",width:32,height:32}))},vt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/websocket.svg",width:32,height:32}))},mt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/native.svg",width:32,height:32}))},bt=function(t){return i.createElement(st,Object.assign({},t,{url:"icons/battery.svg",width:32,height:32}))};function Ot(){var t=Object(h.a)(["\n  text-align: center;\n  font-variant: ",";\n  line-height: 1.2em;\n"]);return Ot=function(){return t},t}var Et=it.div(Ot(),function(t){return t.primary?"all-small-caps":"normal"});function yt(){var t=Object(h.a)(["\n  padding-top: 4px;\n"]);return yt=function(){return t},t}function jt(){var t=Object(h.a)(["\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n  text-decoration: none;\n  color: ","\n  background-color: rgba(0, 0, 0, 0);\n  transition: background-color 300ms;\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n\n  &.active-main-menu-item {\n    background-color: ",";\n    color: ","\n  }\n"]);return jt=function(){return t},t}function St(){var t=Object(h.a)(["\n  height: 100%;\n  text-align: center;\n  font-variant: small-caps;\n  text-transform: uppercase;\n  font-size: 0.8em;\n  flex: 1;\n"]);return St=function(){return t},t}function Nt(){var t=Object(h.a)(["\n  display: flex;\n  flex-direction: row;\n  height: ",";\n  flex: 1;\n  max-width: 600px;\n"]);return Nt=function(){return t},t}function kt(){var t=Object(h.a)(["\n  display: flex;\n  flex-direction: row;\n  justify-content: center;\n  background-color: #000;\n"]);return kt=function(){return t},t}var wt=it.div(kt()),Ct=it.ul(Nt(),function(t){return t.theme.size.menuHeight}),Tt=it.li(St()),xt=it(tt.a)(jt(),function(t){return Object(Z.a)(t.theme.size.darkerLighterPercentage,t.theme.text.primary)},function(t){return t.theme.bg.secondary},function(t){return t.theme.text.primary}),It=it(Et)(yt()),Dt=function(){return i.createElement(wt,null,i.createElement(Ct,null,i.createElement(Tt,null,i.createElement(xt,{to:"/status",activeClassName:"active-main-menu-item"},i.createElement(ut,null),i.createElement(It,null,"Status"))),i.createElement(Tt,null,i.createElement(xt,{to:"/map",activeClassName:"active-main-menu-item"},i.createElement(lt,null),i.createElement(It,null,"Map"))),i.createElement(Tt,null,i.createElement(xt,{to:"/bot",activeClassName:"active-main-menu-item"},i.createElement(ft,null),i.createElement(It,null,"Bot"))),i.createElement(Tt,null,i.createElement(xt,{to:"/remote",activeClassName:"active-main-menu-item"},i.createElement(ht,null),i.createElement(It,null,"Remote"))),i.createElement(Tt,null,i.createElement(xt,{to:"/settings",activeClassName:"active-main-menu-item"},i.createElement(dt,null),i.createElement(It,null,"Settings")))))};function Rt(){var t=Object(h.a)(["\n  position: relative;\n  flex: 1;\n  border-radius: 8px 8px 0 0;\n  padding: ",";\n"]);return Rt=function(){return t},t}var At,Lt,Mt=it.div(Rt(),function(t){return t.text?"16px":t.grid?t.theme.size.gridGap:"0"}),Ut=function(){return i.createElement(Mt,{text:!0},"Bot")},Bt=function(){return i.createElement(Mt,{text:!0},"Map")};function Gt(){var t=Object(h.a)(["\n          animation: ","\n            3s ease;\n          animation-iteration-count: infinite;\n          animation-delay: 1s;\n        "]);return Gt=function(){return t},t}function Ft(){var t=Object(h.a)(["\n          display: flex;\n          flex-direction: column;\n          align-items: center;\n          justify-content: center;\n          padding: 16px;\n          overflow: hidden;\n          background-color: ",";\n        "]);return Ft=function(){return t},t}function zt(){var t=Object(h.a)(["\n          line-height: 1.25em;\n          text-align: center;\n          margin-top: 8px;\n        "]);return zt=function(){return t},t}function Wt(){var t=Object(h.a)(["\n  position: relative;\n  background-color: ",";\n  font-variant: ",";\n\n  ","\n\n  ","\n\n  ","\n"]);return Wt=function(){return t},t}function Ht(){var t=Object(h.a)(["\n  display: grid;\n  grid-gap: ",";\n  height: calc(\n    100vh -\n      (\n        "," +\n          "," * 2\n      )\n  );\n"]);return Ht=function(){return t},t}!function(t){t.GOOD="GOOD",t.WARN="WARN",t.BAD="BAD"}(Lt||(Lt={}));var Pt=it.div(Ht(),function(t){return t.theme.size.gridGap},function(t){return t.theme.size.menuHeight},function(t){return t.theme.size.gridGap}),Vt=(At={},Object(y.a)(At,Lt.GOOD,at.bg.good),Object(y.a)(At,Lt.WARN,at.bg.warn),Object(y.a)(At,Lt.BAD,at.bg.bad),At),qt=it.div(Wt(),function(t){return t.theme.bg.tertiary},function(t){return t.primary?"all-small-caps":"normal"},function(t){return t.text?Object(m.c)(zt()):""},function(t){return t.status?Object(m.c)(Ft(),Vt[t.status]):""},function(t){return t.status===Lt.BAD?Object(m.c)(Gt(),t.theme.animation.pulse(Vt[t.status])):""}),Kt=n(37),Xt=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).ref=i.createRef(),n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"componentDidMount",value:function(){var t=this,e=this.ref.current;if(e){var n=Kt.create({zone:e,color:"#FFF",size:200,position:{left:"50%",top:"50%"},mode:"static",lockX:!0===this.props.x,lockY:!0===this.props.y}),r=this.props.onEvent;if("function"===typeof r){var a=this.props.bind?this.props.bind:"start move end dir plain";n.on(a,function(e,n){r(t.props.name,e,n)}).on("removed",function(t,e){e.off(a)})}}else console.warn("grid item dom node not found")}},{key:"render",value:function(){return i.createElement("div",{className:"joystick",ref:this.ref})}}]),e}(i.Component),_t=n(38),Jt=n.n(_t),Yt=function(){function t(e){Object(c.a)(this,t),this.options=e}return Object(s.a)(t,[{key:"calculateMotorSpeeds",value:function(t,e){return this.limit({left:t+e,right:t-e},this.options.maxSpeed)}},{key:"getSpeedEncoderCount",value:function(t){var e=t/(this.options.wheelDiameter*Math.PI)*(this.options.encoderCountsPerRotation*this.options.gearboxRatio);return Math.floor(e)}},{key:"limit",value:function(t,e){var n=Math.max(Math.abs(t.left),Math.abs(t.right)),r=Math.min(e/n,1);return{left:t.left*r,right:t.right*r}}},{key:"getEncoderSpeeds",value:function(t){return{left:this.getSpeedEncoderCount(t.left),right:this.getSpeedEncoderCount(t.right)}}}]),t}(),$t=function(){function t(e){var n=this;Object(c.a)(this,t),this.speed=0,this.omega=0,this.options=Object(N.a)({log:P.dummyLogger},e),this.robot=this.options.robot,this.kinematics=new Yt(this.options.vehicle),this.scheduleUpdateMotorSpeeds=Jt()(function(){return n.updateMotorSpeeds()},this.options.vehicle.speedUpdateInterval)}return Object(s.a)(t,[{key:"setSpeed",value:function(t){this.speed=t,this.scheduleUpdateMotorSpeeds()}},{key:"setOmega",value:function(t){this.omega=t,this.scheduleUpdateMotorSpeeds()}},{key:"updateMotorSpeeds",value:function(){var t=this.kinematics.calculateMotorSpeeds(this.speed,this.omega),e=this.kinematics.getEncoderSpeeds(t);this.robot.setSpeed(e.left,e.right)}}]),t}();function Qt(){var t=Object(h.a)(["\n  grid-template-columns: 1fr;\n"]);return Qt=function(){return t},t}var Zt=it(Pt)(Qt()),te=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),i=0;i<r;i++)a[i]=arguments[i];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).remoteController=new $t({log:console,vehicle:B.vehicle,robot:_}),n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"render",value:function(){var t=this;return i.createElement(Mt,{grid:!0},i.createElement(Zt,null,i.createElement(qt,null,i.createElement(Xt,{x:!0,name:"speed",onEvent:function(e,n,r){return t.onJoystickEvent(e,n,r)}})),i.createElement(qt,null,i.createElement(Xt,{y:!0,name:"omega",onEvent:function(e,n,r){return t.onJoystickEvent(e,n,r)}}))))}},{key:"onJoystickEvent",value:function(t,e,n){if(-1!==["move","end"].indexOf(e.type)){var r="move"===e.type,a=r?Math.sin(n.angle.radian)*n.distance:0,i=r?Math.cos(n.angle.radian)*n.distance:0;switch(t){case"speed":this.remoteController.setSpeed(-1*i/100);break;case"omega":this.remoteController.setOmega(a/100);break;default:throw new Error('Got unexpected joystick "'.concat(t,'" info'))}}}}]),e}(i.Component),ee=function(){return i.createElement(Mt,{text:!0},i.createElement("button",{onClick:function(){return window.location.href="http://kallaspriit"}},"Open http://kallaspriit"))};var ne=function(){return i.createElement(b.c,{to:[G]},function(t){var e=function(t){switch(t){case I.UNKNOWN:return Lt.BAD;case I.FULL:return Lt.GOOD;case I.LOW:return Lt.WARN;case I.CRITICAL:return Lt.BAD;default:return function(t,e){throw new Error("".concat(e," (").concat(t,")"))}(t,"got unexpected battery state")}}(t.batteryState),n=t.state.batteryVoltage?"".concat(t.state.batteryVoltage.toFixed(1),"V"):"Unknown";return i.createElement(qt,{status:e,onClick:function(){return _.requestVoltage()}},i.createElement(bt,null),i.createElement(Et,{primary:!0},"Battery"),i.createElement(Et,null,n))})};function re(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:" ",r="string"===typeof t?t:t.toString();if(r.length>=e)return r;var a=e-r.length;return"".concat(new Array(a+1).join(n)).concat(r)}var ae,ie=n(41),oe=function(t){function e(){var t,n;Object(c.a)(this,e);for(var r=arguments.length,a=new Array(r),o=0;o<r;o++)a[o]=arguments[o];return(n=Object(u.a)(this,(t=Object(l.a)(e)).call.apply(t,[this].concat(a)))).ref=i.createRef(),n}return Object(f.a)(e,t),Object(s.a)(e,[{key:"componentDidUpdate",value:function(){if(!1!==this.props.scrollToBottom){var t=this.ref.current;if(t)t.scrollHeight-t.clientHeight<=t.scrollTop+50&&(t.scrollTop=t.scrollHeight-t.clientHeight);else console.warn("auto-scroll dom node not found")}}},{key:"render",value:function(){var t=this.props,e=(t.scrollToBottom,Object(ie.a)(t,["scrollToBottom"]));return i.createElement("div",Object.assign({},e,{ref:this.ref}),this.props.children)}}]),e}(i.Component);function ce(){var t=Object(h.a)(["\n  background-color: ",";\n"]);return ce=function(){return t},t}function se(){var t=Object(h.a)(["\n  box-sizing: content-box;\n  position: absolute;\n  bottom: ",";\n  right: ",";\n  width: 32px;\n  height: 32px;\n  padding: 10px;\n  background-color: ",";\n"]);return se=function(){return t},t}function ue(){var t=Object(h.a)(["\n  display: inline-block;\n  padding: 0 4px;\n  margin-left: 8px;\n  border-radius: 8px;\n  background-color: ",";\n  color: ",";\n"]);return ue=function(){return t},t}function le(){var t=Object(h.a)(["\n  padding-left: 6px;\n  border-left: 2px solid ",";\n  margin-left: 6px;\n"]);return le=function(){return t},t}function fe(){var t=Object(h.a)(["\n  color: ",";\n"]);return fe=function(){return t},t}function he(){var t=Object(h.a)([""]);return he=function(){return t},t}function de(){var t=Object(h.a)(["\n  flex: 1;\n  overflow: scroll;\n  padding: 8px;\n"]);return de=function(){return t},t}function pe(){var t=Object(h.a)(['\n  grid-column: 1 / 4;\n  font-family: Consolas, "Courier New", Courier, monospace;\n  display: flex;\n  overflow: hidden;\n']);return pe=function(){return t},t}var ge=it(qt)(pe()),ve=it(oe)(de()),me=it.div(he()),be=it.span(fe(),function(t){return t.theme.text.secondary}),Oe=(ae={},Object(y.a)(ae,j.INFO,"#666"),Object(y.a)(ae,j.RX,"#090"),Object(y.a)(ae,j.TX,"#FF8000"),Object(y.a)(ae,j.ERROR,"#900"),ae),Ee=it.span(le(),function(t){return Oe[t.type]}),ye=it.span(ue(),function(t){return t.theme.text.primary},function(t){return t.theme.bg.tertiary}),je=it.div(se(),function(t){return t.theme.size.gridGap},function(t){return t.theme.size.gridGap},function(t){return t.theme.bg.tertiary}),Se=it(function(t){return i.createElement(st,Object.assign({},t,{url:"icons/clear.svg",width:32,height:32}))})(ce(),function(t){return t.theme.text.secondary}),Ne=function(){return i.createElement(b.c,{to:[D]},function(t){return i.createElement(ge,null,i.createElement(ve,null,t.state.entries.map(function(t){return i.createElement(me,{key:t.id},i.createElement(be,null,(e=t.time,"".concat(re(e.getHours(),2,"0"),":")+"".concat(re(e.getMinutes(),2,"0"),":")+"".concat(re(e.getSeconds(),2,"0"),".")+"".concat(re(e.getMilliseconds(),3,"0")))),i.createElement(Ee,{type:t.type},t.message),t.count>1?i.createElement(ye,null,t.count):null);var e})),i.createElement(je,{onClick:function(){return t.clear()}},i.createElement(Se,null)))})},ke=n(27),we=n.n(ke),Ce=function(){return i.createElement(b.c,{to:[G]},function(t){var e=t.state.transportState===C.CONNECTED?Lt.GOOD:Lt.BAD,n=t.state.transportState!==C.CONNECTED||void 0===t.state.remoteIp?we()(t.state.transportState):t.state.remoteIp;return i.createElement(qt,{status:e,onClick:function(){return _.ping(void 0===t.getConnectedSerial())}},"Native"===X.getName()?i.createElement(mt,null):i.createElement(vt,null),i.createElement(Et,{primary:!0},X.getName()),i.createElement(Et,null,n))})},Te=function(){return i.createElement(b.c,{to:[G]},function(t){var e=t.getConnectedSerial(),n=void 0!==e?Lt.GOOD:Lt.BAD,r=e&&e.type===T.BLUETOOTH?pt:gt,a=e?e.type:"Serial",o=we()(e?e.state:"Disconnected");return i.createElement(qt,{status:n},i.createElement(r,null),i.createElement(Et,{primary:!0},a),i.createElement(Et,null,o))})};function xe(){var t=Object(h.a)(["\n  grid-template-columns: 1fr 1fr 1fr;\n  grid-template-rows: 100px;\n"]);return xe=function(){return t},t}var Ie=it(Pt)(xe()),De=function(){return i.createElement(Mt,{grid:!0},i.createElement(Ie,null,i.createElement(Te,null),i.createElement(Ce,null),i.createElement(ne,null),i.createElement(Ne,null)))};function Re(){var t=Object(h.a)(["\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  animation: "," 1000ms;\n"]);return Re=function(){return t},t}var Ae=it.div(Re(),function(t){return t.theme.animation.fadeIn}),Le=function(t){function e(){return Object(c.a)(this,e),Object(u.a)(this,Object(l.a)(e).apply(this,arguments))}return Object(f.a)(e,t),Object(s.a)(e,[{key:"render",value:function(){return i.createElement(m.a,{theme:at},i.createElement(b.b,null,i.createElement(ot,null),i.createElement(Q,null),i.createElement(d.a,null,i.createElement(Ae,null,i.createElement(p.a,null,i.createElement(g.a,{path:"/status",component:De}),i.createElement(g.a,{path:"/map",component:Bt}),i.createElement(g.a,{path:"/remote",component:te}),i.createElement(g.a,{path:"/bot",component:Ut}),i.createElement(g.a,{path:"/settings",component:ee}),i.createElement(g.a,{exact:!0,path:"/"},i.createElement(v.a,{to:"/status"}))),i.createElement(Dt,null)))))}}]),e}(i.Component);o.render(i.createElement(Le,null),document.getElementById("root"))}},[[43,2,1]]]);
//# sourceMappingURL=main.29756f8f.chunk.js.map