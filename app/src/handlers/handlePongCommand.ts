import { ContainerMap } from "../components/Router";
import { robot } from "../services/robot";

export function handlePongCommand(args: string[], { log }: ContainerMap) {
  const pingTimeTaken = robot.getPingTimeTaken();

  if (pingTimeTaken < 0) {
    return;
  }

  log.addEntry(`# ping: ${pingTimeTaken} ms`);
}
