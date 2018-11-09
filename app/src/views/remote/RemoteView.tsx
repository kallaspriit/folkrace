import * as React from "react";

import Joystick from "../../components/joystick/Joystick";
import { JoystickEvent, JoystickEventName, JoystickInstance } from "nipplejs";
import config from "../../config";
import RemoteController from "../../lib/web-socket-client/RemoteController";
import webSocketClient from "../../services/webSocketClient";

import "./RemoteView.scss";

// TODO: show track speeds on edges (target and real)
export default class RemoteView extends React.Component {
  private readonly remoteController = new RemoteController({
    webSocketClient,
    log: console,
    vehicle: config.vehicle
  });

  render() {
    return (
      <div className="view view--grid remote-view">
        <div className="joystick-grid">
          <div className="joystick-grid__item">
            <Joystick
              name="speed"
              onEvent={(name, event, info) =>
                this.onJoystickEvent(name, event, info)
              }
            />
          </div>
          <div className="joystick-grid__item">
            <Joystick
              name="omega"
              onEvent={(name, event, info) =>
                this.onJoystickEvent(name, event, info)
              }
            />
          </div>
        </div>
      </div>
    );
  }

  private onJoystickEvent(
    name: string,
    event: JoystickEvent,
    info: JoystickInstance
  ) {
    const interestingEvents: JoystickEventName[] = ["move", "end"];

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
