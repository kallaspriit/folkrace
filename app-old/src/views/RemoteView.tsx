import {
  EventData,
  JoystickEventTypes,
  JoystickOutputData,
  ManagerOnlyEventTypes,
} from "nipplejs";
import React from "react";

import { Cell, Grid } from "../components/Grid";
import { Joystick } from "../components/Joystick";
import { View } from "../components/View";
import { config } from "../config";
import { RemoteController } from "../lib/remote-controller";
import { robot } from "../services/robot";

// TODO: show track speeds on edges (target and real)
export class RemoteView extends React.Component {
  private readonly remoteController = new RemoteController({
    vehicle: config.vehicle,
    robot,
    // log: console,
  });

  render() {
    return (
      <View>
        <Grid>
          <Cell>
            <Joystick
              x
              name="speed"
              onEvent={(name, event, info) =>
                this.onJoystickEvent(name, event, info)
              }
            />
          </Cell>
          <Cell>
            <Joystick
              y
              name="omega"
              onEvent={(name, event, info) =>
                this.onJoystickEvent(name, event, info)
              }
            />
          </Cell>
        </Grid>
      </View>
    );
  }

  private onJoystickEvent(
    name: string,
    event: EventData,
    info: JoystickOutputData
  ) {
    const interestingEvents: (JoystickEventTypes | ManagerOnlyEventTypes)[] = [
      "move",
      "end",
    ];

    if (interestingEvents.indexOf(event.type) === -1) {
      return;
    }

    const isMoveEvent = event.type === "move";

    const xPos = isMoveEvent ? Math.sin(info.angle.radian) * info.distance : 0;
    const yPos = isMoveEvent ? Math.cos(info.angle.radian) * info.distance : 0;

    // console.log(`${name} x: ${xPos}, y: ${yPos}, distance: ${info.distance}`, this.remoteController);

    switch (name) {
      case "speed":
        this.remoteController.setSpeed((yPos * -1) / 100.0);
        break;

      case "omega":
        this.remoteController.setOmega(xPos / 100.0);
        break;

      default:
        throw new Error(`Got unexpected joystick "${name}" info`);
    }
  }
}
