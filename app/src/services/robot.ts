import { Robot } from "../lib/robot";
import { webSocketClient } from "./webSocketClient";

export const robot = new Robot(webSocketClient);
