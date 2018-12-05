import { Robot } from "../lib/robot";

import { websocketTransport } from "./websocketTransport";

export const robot = new Robot(websocketTransport);
