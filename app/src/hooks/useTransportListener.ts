import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import { TransportListener } from "../lib/transport";
import { multiTransport } from "../services/multiTransport";
import { websocketTransport } from "../services/websocketTransport";
import { websocketHostState } from "../state/websocketHostState";

export function useTransportListener(listener: TransportListener) {
  const websocketHost = useRecoilValue(websocketHostState);

  // register transport listener
  useEffect(() => {
    multiTransport.addListener(listener);

    // attempt to establish connection
    void multiTransport.connect();

    return () => {
      multiTransport.removeListener(listener);
    };
  }, [listener]);

  // update websocket host if state changes
  useEffect(() => {
    const existingWebsocketHost = websocketTransport.getOptions().host;

    // skip if host did not change
    if (websocketHost === existingWebsocketHost) {
      return;
    }

    console.log("host changed", websocketHost);

    websocketTransport.updateOptions({
      host: websocketHost,
    });
    websocketTransport.connect();
  }, [websocketHost]);
}
