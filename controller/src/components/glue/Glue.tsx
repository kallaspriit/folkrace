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
      webSocketClient.subscribe({
        onOpen: event => {
          console.log("glue: ws open", event);
        },
        onClose: event => {
          console.log("glue: ws close", event);
        },
        onError: event => {
          console.log("glue: ws error", event);
        },
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
