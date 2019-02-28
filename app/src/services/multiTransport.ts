import { MultiTransport } from "../lib/transport";

import { nativeTransport } from "./nativeTransport";
import { simulatedTransport } from "./simulatedTransport";
import { websocketTransport } from "./websocketTransport";

export const multiTransport = new MultiTransport({
  // log: console
});

// register sub-transports in preferred order
multiTransport.addTransport(nativeTransport);
multiTransport.addTransport(websocketTransport);
multiTransport.addTransport(simulatedTransport);
