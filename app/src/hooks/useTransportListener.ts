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

    // skip if host missing or has not changed
    if (!websocketHost || websocketHost === existingWebsocketHost) {
      return;
    }

    websocketTransport.updateOptions({
      host: websocketHost,
    });
    websocketTransport.connect();
  }, [websocketHost]);
}
