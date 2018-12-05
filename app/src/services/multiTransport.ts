import { MultiTransport } from "../lib/transport/MultiTransport";

import { nativeTransport } from "./nativeTransport";
import { websocketTransport } from "./websocketTransport";

export const multiTransport = new MultiTransport({
  // log: console
});

// register sub-transports in preferred order
multiTransport.addTransport(nativeTransport);
multiTransport.addTransport(websocketTransport);
