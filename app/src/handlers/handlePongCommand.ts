import { robot } from "../services/robot";

import { ContainerMap } from "./";

export function handlePongCommand(args: string[], { log }: ContainerMap) {
  if (!robot.pingSentTime) {
    return;
  }

  const pingTimeTaken = Date.now() - robot.pingSentTime;

  robot.pingSentTime = undefined;

  log.addEntry(`# ping: ${pingTimeTaken} ms`);
}
