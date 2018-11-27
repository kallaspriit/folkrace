import { ContainerMap } from "../components/Router";
import { robot } from "../services/robot";

export function handlePongCommand(args: string[], { log }: ContainerMap) {
  if (!robot.pingSentTime) {
    return;
  }

  const pingTimeTaken = Date.now() - robot.pingSentTime;

  robot.pingSentTime = undefined;

  log.addEntry(`# ping: ${pingTimeTaken} ms`);
}
