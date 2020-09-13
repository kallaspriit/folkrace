import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Root } from "./Root";
import * as serviceWorker from "./serviceWorker";

// render root component
ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

// use hot reload if available
if (module.hot) {
  module.hot.accept("./Root", () => {
    // clear old console messages and notify about hot-reload
    console.clear();
    console.log("-- Hot reloaded the app (press F5 for full reload) --");

    // get updated root component
    const NextRoot = require("./Root").Root;

    // render updated root
    ReactDOM.render(<NextRoot />, document.getElementById("root"));
  });
}
