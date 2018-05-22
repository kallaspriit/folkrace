import * as React from "react";
import { Subscribe } from "unstated";
import webSocketClient from "../../services/webSocketClient";
import LogContainer from "../../containers/LogContainer";

let isDone = false;

// glue component, connects external data to containers, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer]}>
    {(log: LogContainer) => {
      // return if already set up
      if (isDone) {
        return null;
      }

      // setup connections
      webSocketClient.addListener({
        onMessage: message => {
          log.addEntry(message);
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
