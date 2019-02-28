import { SimulatedTransport } from "../lib/simulator";

import { simulatedRobot } from "./simulatedRobot";

export const simulatedTransport = new SimulatedTransport({
  simulatedRobot,
  log: console,
});
