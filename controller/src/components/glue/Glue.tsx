import * as React from "react";
import { Subscribe } from "unstated";
import webSocketClient from "../../services/webSocketClient";
import LogContainer from "../../containers/LogContainer";

let isFirstRender = true;

// sets up connections between components
function setupConnections(log: LogContainer) {
  webSocketClient.addListener({
    onMessage: message => {
      log.addEntry(message);
    },
  });
}

// glue component, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer]}>
    {(log: LogContainer) => {
      // return if already set up
      if (!isFirstRender) {
        return null;
      }

      isFirstRender = false;

      setupConnections(log);

      return null;
    }}
  </Subscribe>
);

export default Glue;
