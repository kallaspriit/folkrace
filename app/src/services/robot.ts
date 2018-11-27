import { Robot } from "../lib/robot";
import webSocketClient from "./webSocketClient";

const robot = new Robot(webSocketClient);

export default robot;
