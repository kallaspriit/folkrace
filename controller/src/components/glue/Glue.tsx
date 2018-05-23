import * as React from "react";
import { Subscribe } from "unstated";
import webSocketClient from "../../services/webSocketClient";
import LogContainer from "../../containers/LogContainer";
import StatusContainer from "../../containers/StatusContainer";

let isDone = false;

// glue component, connects external data to containers, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => {
      // return if already set up
      if (isDone) {
        return null;
      }

      // set initial state
      statusContainer.setWebSocketState(webSocketClient.getState());

      // subscribe to web-socket events
      webSocketClient.subscribe({
        onConnecting: (_ws, wasConnected) => {
          console.log(`glue: ws ${wasConnected ? "reconnecting" : "connecting"}`, event);
        },
        onOpen: (_ws, event) => {
          console.log("glue: ws open", event);

          logContainer.addEntry("web-socket connection established");
        },
        onClose: (_ws, event, wasConnected) => {
          console.log("glue: ws close", event);

          if (wasConnected) {
            logContainer.addEntry("web-socket connection was lost", true);
          } else {
            logContainer.addEntry("establishing web-socket connection failed", true);
          }
        },
        onError: (_ws, event, wasConnected) => {
          console.log("glue: ws error", event, wasConnected);
        },
        onMessage: (_ws, message) => {
          logContainer.addEntry(message);
        },
        onStateChanged: (_ws, newState, oldState) => {
          console.log(`glue: ws state changed from ${oldState} to ${newState}`);

          statusContainer.setWebSocketState(newState);
        },
      });

      // don't run this logic again
      isDone = true;

      // don't render anything
      return null;
    }}
  </Subscribe>
);

export default Glue;
