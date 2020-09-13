import { useEffect } from "react";
import { TransportListener } from "../lib/transport";
import { multiTransport } from "../services/multiTransport";

export function useTransportListener(listener: TransportListener) {
  useEffect(() => {
    multiTransport.addListener(listener);

    // attempt to establish connection
    void multiTransport.connect();

    return () => {
      multiTransport.removeListener(listener);
    };
  });
}
