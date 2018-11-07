(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{25:function(e,t,n){e.exports=n(59)},32:function(e,t,n){},36:function(e,t,n){},53:function(e,t,n){},55:function(e,t,n){},57:function(e,t,n){},59:function(e,t,n){"use strict";n.r(t);var o,a=n(0),r=n(21),i=n(2),s=n(61),c=n(64),l=n(60),u=n(62),m=n(6),d=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.state={entries:[]},t.lastId=0,t}return i.b(t,e),t.prototype.addEntry=function(e,t){var n=this;void 0===t&&(t=!0),this.setState(function(o){var a=n.state.entries.length>0?n.state.entries[n.state.entries.length-1]:null;if(null!==a&&e===a.message&&t)return{entries:o.entries.slice(0,n.state.entries.length-1).concat([i.a({},a,{time:new Date})])};for(var r=o.entries.concat([{id:(n.lastId++).toString(),time:new Date,message:e}]);r.length>200;)r.shift();return{entries:r}}).catch(function(e){return console.error(e)})},t.prototype.clear=function(){this.setState({entries:[]}).catch(function(e){return console.error(e)})},t}(m.a),p={webSocket:{host:void 0!==localStorage.webSocketHost?localStorage.webSocketHost:"127.0.0.1",port:void 0!==localStorage.webSocketPort?parseInt(localStorage.webSocketPort,10):8e3,useSSL:!1,reconnectInterval:3e3},rules:{battery:{low:15,critical:13.5}},vehicle:{trackWidth:.15,maxSpeed:1,wheelDiameter:.039,encoderCountsPerRotation:20,gearboxRatio:25,speedUpdateInterval:50}},h=n(13);!function(e){e.DISCONNECTED="DISCONNECTED",e.CONNECTING="CONNECTING",e.RECONNECTING="RECONNECTING",e.CONNECTED="CONNECTED"}(o||(o={}));var E,f,g=function(){function e(e){this.connectionState=o.DISCONNECTED,this.listeners=[],this.wasConnected=!1,this.options=i.a({useSSL:!1,log:h.dummyLogger,reconnectInterval:1e3},e),this.log=this.options.log;var t=(this.options.useSSL?"wss":"ws")+"://"+this.options.host+":"+this.options.port;this.ws=this.connect(t)}return e.prototype.subscribe=function(e){this.listeners.push(e)},e.prototype.unsubscribe=function(e){this.listeners=this.listeners.filter(function(t){return t!==e})},Object.defineProperty(e.prototype,"state",{get:function(){return this.connectionState},enumerable:!0,configurable:!0}),e.prototype.send=function(e,t){var n=this;void 0===t&&(t=!0),this.state===o.CONNECTED?(this.listeners.forEach(function(t){return t.onSendMessage(n,e)}),this.ws.send(e+(t?"\n":""))):this.log.warn('sending message "'+e+'" requested but web-socket is '+this.connectionState)},e.prototype.setState=function(e){var t=this;if(e!==this.connectionState){var n=this.connectionState;this.connectionState=e,this.listeners.forEach(function(o){return o.onStateChanged(t,e,n)})}},e.prototype.connect=function(e){var t=this;return this.log.info("connecting to web-socket server at "+e),this.setState(this.wasConnected?o.RECONNECTING:o.CONNECTING),this.listeners.forEach(function(e){return e.onConnecting(t,t.wasConnected)}),this.ws=new WebSocket(e),this.ws.onopen=function(e){t.log.info("established web-socket connection"),t.wasConnected=!0,t.setState(o.CONNECTED),t.listeners.forEach(function(n){return n.onOpen(t,e)})},this.ws.onclose=function(n){var a="code: "+n.code+", reason: "+n.reason+", was clean: "+(n.wasClean?"yes":"no");t.wasConnected?t.log.warn("connection to web-socket was lost ("+a+")"):t.log.warn("connecting to web-socket failed ("+a+")"),t.setState(o.DISCONNECTED),setTimeout(function(){t.ws=t.connect(e)},t.options.reconnectInterval),t.listeners.forEach(function(e){return e.onClose(t,n,t.wasConnected)})},this.ws.onerror=function(e){t.log.warn("got web-socket error"),t.listeners.forEach(function(n){return n.onError(t,e,t.wasConnected)})},this.ws.onmessage=function(e){t.listeners.forEach(function(n){return n.onMessage(t,e.data)})},this.ws},e}();!function(e){e.CONNECTING="CONNECTING",e.CONNECTED="CONNECTED",e.DISCONNECTED="DISCONNECTED",e.NOT_SUPPORTED="NOT_SUPPORTED",e.DEVICE_NOT_FOUND="DEVICE_NOT_FOUND",e.DISABLED="DISABLED"}(E||(E={})),function(e){e.UNKNOWN="UNKNOWN",e.FULL="FULL",e.LOW="LOW",e.CRITICAL="CRITICAL"}(f||(f={}));var v,N,C=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.state={bluetoothState:E.DISCONNECTED,webSocketState:o.DISCONNECTED},t}return i.b(t,e),t.prototype.setBluetoothState=function(e,t){this.setState({bluetoothState:e,bluetoothDeviceName:t})},t.prototype.setWebSocketState=function(e){this.setState({webSocketState:e})},t.prototype.setBatteryVoltage=function(e){this.setState({batteryVoltage:e})},Object.defineProperty(t.prototype,"batteryState",{get:function(){var e=this.state.batteryVoltage;return void 0===e?f.UNKNOWN:e<=p.rules.battery.critical?f.CRITICAL:e<=p.rules.battery.low?f.LOW:f.FULL},enumerable:!0,configurable:!0}),t}(m.a),_=new g(i.a({},p.webSocket,{log:console}));!function(e){e.BLUETOOTH="bluetooth",e.GET_VOLTAGE="get-voltage"}(N||(N={}));var w=!1,b=null;var S=((v={})[N.BLUETOOTH]=function(e,t){var n,o=e[0];switch(o){case E.CONNECTED:n=e[1]}o===E.CONNECTED?(_.send("get-voltage"),b=window.setInterval(function(){_.send("get-voltage")},6e4)):(null!==b&&(window.clearInterval(b),b=null),t.statusContainer.setBatteryVoltage(void 0)),t.statusContainer.setBluetoothState(e[0],n)},v[N.GET_VOLTAGE]=function(e,t){var n=parseFloat(e[0]);t.statusContainer.setBatteryVoltage(n)},v);var y=function(){return a.createElement(m.c,{to:[d,C]},function(e,t){return w?null:(t.setWebSocketState(_.state),_.subscribe({onConnecting:function(e,t){},onOpen:function(t,n){e.addEntry("web-socket connection established")},onClose:function(t,n,o){o?e.addEntry("web-socket connection was lost"):e.addEntry("establishing web-socket connection failed")},onError:function(e,t,n){},onMessage:function(n,o){!function(e,t){if(0!==e.length){t.logContainer.addEntry("< "+e);var n=e.split(":"),o=n[0],a=n.slice(1);!function(e,t,n){var o=S[e];void 0!==o?o(t,n):console.warn('missing web-socket command handler for "'+e+'"')}(o,a,t)}}(o,{logContainer:e,statusContainer:t})},onStateChanged:function(e,n,a){t.setWebSocketState(n),n===o.DISCONNECTED&&(t.setBluetoothState(E.DISCONNECTED),t.setBatteryVoltage(void 0))},onSendMessage:function(t,n){e.addEntry("> "+n)}}),w=!0,null)})},O=n(63),T=(n(32),function(){return a.createElement("div",{className:"main-menu"},a.createElement("ul",{className:"main-menu__nav"},a.createElement("li",null,a.createElement(O.a,{to:"/status",activeClassName:"active"},a.createElement("div",{className:"main-menu__nav__icon"},a.createElement("i",{className:"icon icon__status"})),a.createElement("div",{className:"main-menu__nav__text"},a.createElement("span",null,"status")))),a.createElement("li",null,a.createElement(O.a,{to:"/map",activeClassName:"active"},a.createElement("div",{className:"main-menu__nav__icon"},a.createElement("i",{className:"icon icon__map"})),a.createElement("div",{className:"main-menu__nav__text"},a.createElement("span",null,"map")))),a.createElement("li",null,a.createElement(O.a,{to:"/ai",activeClassName:"active"},a.createElement("div",{className:"main-menu__nav__icon"},a.createElement("i",{className:"icon icon__bot"})),a.createElement("div",{className:"main-menu__nav__text"},a.createElement("span",null,"bot")))),a.createElement("li",null,a.createElement(O.a,{to:"/remote",activeClassName:"active"},a.createElement("div",{className:"main-menu__nav__icon"},a.createElement("i",{className:"icon icon__remote"})),a.createElement("div",{className:"main-menu__nav__text"},a.createElement("span",null,"remote")))),a.createElement("li",null,a.createElement(O.a,{to:"/settings",activeClassName:"active"},a.createElement("div",{className:"main-menu__nav__icon"},a.createElement("i",{className:"icon icon__settings"})),a.createElement("div",{className:"main-menu__nav__text"},a.createElement("span",null,"settings"))))))}),D=function(){return a.createElement("div",{className:"view view--text bot-view"},"Bot")},k=function(){return a.createElement("div",{className:"view view--text map-view"},"Map")},I=n(11),x=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.ref=a.createRef(),t}return i.b(t,e),t.prototype.componentDidMount=function(){var e=this,t=this.ref.current;if(t){var n=I.create({zone:t,color:"#FFF",size:200,position:{left:"50%",top:"50%"},mode:"static"}),o=this.props.onEvent;if("function"===typeof o){var a=this.props.bind?this.props.bind:"start move end dir plain";n.on(a,function(t,n){o(e.props.name,t,n)}).on("removed",function(e,t){t.off(a)})}}else console.warn("grid item dom node not found")},t.prototype.render=function(){return a.createElement("div",{className:"joystick",ref:this.ref})},t}(a.Component),L=n(23),M=n.n(L),U=function(){function e(e){this.options=e}return e.prototype.calculateMotorSpeeds=function(e,t){return this.limit({left:e+t,right:e-t},this.options.maxSpeed)},e.prototype.getSpeedEncoderCount=function(e){var t=e/(this.options.wheelDiameter*Math.PI)*(this.options.encoderCountsPerRotation*this.options.gearboxRatio);return Math.floor(t)},e.prototype.limit=function(e,t){var n=Math.max(Math.abs(e.left),Math.abs(e.right)),o=Math.min(t/n,1);return{left:e.left*o,right:e.right*o}},e.prototype.getEncoderSpeeds=function(e){return{left:this.getSpeedEncoderCount(e.left),right:this.getSpeedEncoderCount(e.right)}},e}(),B=function(){function e(e){var t=this;this.speed=0,this.omega=0,this.options=i.a({log:h.dummyLogger},e),this.kinematics=new U(this.options.vehicle),this.scheduleUpdateMotorSpeeds=M()(function(){return t.updateMotorSpeeds()},this.options.vehicle.speedUpdateInterval)}return e.prototype.setSpeed=function(e){this.speed=e,this.scheduleUpdateMotorSpeeds()},e.prototype.setOmega=function(e){this.omega=e,this.scheduleUpdateMotorSpeeds()},e.prototype.updateMotorSpeeds=function(){var e=this.kinematics.calculateMotorSpeeds(this.speed,this.omega),t=this.kinematics.getEncoderSpeeds(e);this.options.webSocketClient.send("set-speed:"+t.left+":"+t.right)},e}(),R=(n(36),function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.remoteController=new B({webSocketClient:_,log:console,vehicle:p.vehicle}),t}return i.b(t,e),t.prototype.render=function(){var e=this;return a.createElement("div",{className:"view view--grid remote-view"},a.createElement("div",{className:"joystick-grid"},a.createElement("div",{className:"joystick-grid__item"},a.createElement(x,{name:"speed",onEvent:function(t,n,o){return e.onJoystickEvent(t,n,o)}})),a.createElement("div",{className:"joystick-grid__item"},a.createElement(x,{name:"omega",onEvent:function(t,n,o){return e.onJoystickEvent(t,n,o)}}))))},t.prototype.onJoystickEvent=function(e,t,n){if(-1!==["move","end"].indexOf(t.type)){var o="move"===t.type,a=o?Math.sin(n.angle.radian)*n.distance:0,r=o?Math.cos(n.angle.radian)*n.distance:0;switch(e){case"speed":this.remoteController.setSpeed(-1*r/100);break;case"omega":this.remoteController.setOmega(a/100);break;default:throw new Error('Got unexpected joystick "'+e+'" info')}}},t}(a.Component)),W=function(){return a.createElement("div",{className:"view view--text settings-view"},"Settings")},F=n(17),G=n(8),V=(n(53),function(e){var t=e.children,n=e.className;return a.createElement("div",{className:G("grid",n)},t)}),P=function(e){function t(){var t=null!==e&&e.apply(this,arguments)||this;return t.ref=a.createRef(),t}return i.b(t,e),t.prototype.componentDidUpdate=function(){if(!0===this.props.scrollToBottom){var e=this.ref.current;if(e)e.scrollHeight-e.clientHeight<=e.scrollTop+50&&(e.scrollTop=e.scrollHeight-e.clientHeight);else console.warn("grid item dom node not found")}},t.prototype.render=function(){return a.createElement("div",{ref:this.ref,className:G("grid__item",this.props.className)},this.props.children)},t}(a.Component);var j=function(e){var t=e.children,n=e.name,o=e.width,r=e.height,i=e.className;return a.createElement("i",{className:G("icon","icon__"+n,i),style:function(e,t){var n={};return"string"===typeof e?n.width=e+(parseFloat(e).toString()===e?"px":""):"number"===typeof e&&(n.width=e+"px"),"string"===typeof t?n.height=t+(parseFloat(t).toString()===t?"px":""):"number"===typeof t&&(n.height=t+"px"),n}(o,r)},t)};function A(e,t,n){void 0===n&&(n=" ");var o="string"===typeof e?e:e.toString();if(o.length>=t)return o;var a=t-o.length;return""+new Array(a+1).join(n)+o}n(55);var H=function(){return a.createElement(m.c,{to:[d,C]},function(e,t){return a.createElement("div",{className:"view view--grid status-view"},a.createElement(V,{className:"status-grid"},a.createElement(P,{className:G("grid-status",t.state.bluetoothState===E.CONNECTED?"bg--good":"bg--bad")},a.createElement("div",{className:"grid__icon"},a.createElement("i",{className:"icon icon__bluetooth"})),a.createElement("div",{className:"grid__text"},a.createElement("div",{className:"grid__text--primary"},"Bluetooth"),a.createElement("div",{className:"grid__text--secondary"},Object(F.titleCase)(t.state.bluetoothState),t.state.bluetoothDeviceName?": "+t.state.bluetoothDeviceName:""))),a.createElement(P,{className:G("grid-status",t.state.webSocketState===o.CONNECTED?"bg--good":"bg--bad")},a.createElement("div",{className:"grid__icon"},a.createElement("i",{className:"icon icon__web-socket"})),a.createElement("div",{className:"grid__text"},a.createElement("div",{className:"grid__text--primary"},"Web Socket"),a.createElement("div",{className:"grid__text--secondary"},Object(F.titleCase)(t.state.webSocketState)))),a.createElement(P,{className:G("grid-status",function(e){switch(e){case f.UNKNOWN:return"bg--warn";case f.FULL:return"bg--good";case f.LOW:return"bg--warn";case f.CRITICAL:return"bg--bad";default:return function(e,t){throw new Error(t+" ("+e+")")}(e,"got unexpected battery state")}}(t.batteryState))},a.createElement("div",{className:"grid__icon"},a.createElement("i",{className:"icon icon__battery"})),a.createElement("div",{className:"grid__text"},a.createElement("div",{className:"grid__text--primary"},"Battery"),a.createElement("div",{className:"grid__text--secondary"},t.state.batteryVoltage?t.state.batteryVoltage.toFixed(1)+"V":"Unknown"))),a.createElement(P,{className:"log",scrollToBottom:!0},e.state.entries.map(function(e){return a.createElement("div",{className:"log__entry",key:e.id},a.createElement("span",{className:"log__entry__time"},A((t=e.time).getHours(),2,"0")+":"+A(t.getMinutes(),2,"0")+":"+A(t.getSeconds(),2,"0")+"."+A(t.getMilliseconds(),3,"0"))," ",a.createElement("span",{className:"log__entry__message"},e.message));var t}))),a.createElement("div",{className:"clear-log-button",onClick:function(){return e.clear()}},a.createElement(j,{name:"clear"})))})},J=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return i.b(t,e),t.prototype.render=function(){return a.createElement(m.b,null,a.createElement(y,null),a.createElement(s.a,null,a.createElement("div",{className:"app"},a.createElement(c.a,null,a.createElement(l.a,{path:"/status",component:H}),a.createElement(l.a,{path:"/map",component:k}),a.createElement(l.a,{path:"/remote",component:R}),a.createElement(l.a,{path:"/ai",component:D}),a.createElement(l.a,{path:"/settings",component:W}),a.createElement(l.a,{exact:!0,path:"/"},a.createElement(u.a,{to:"/status"}))),a.createElement(T,null))))},t}(a.Component);n(57);r.render(a.createElement(J,null),document.getElementById("root"))}},[[25,2,1]]]);
//# sourceMappingURL=main.19a7512c.chunk.js.map