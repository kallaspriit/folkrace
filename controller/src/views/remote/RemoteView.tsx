import * as React from "react";

import "./RemoteView.scss";
import Joystick, { JoystickEvent, JoystickInstance, JoystickEventName } from "../../components/joystick/Joystick";
import RemoteController from "../../lib/web-socket-client/RemoteController";
import webSocketClient from "../../services/webSocketClient";
import config from "../../config";

// TODO: show track speeds on edges (target and real)
export default class RemoteView extends React.Component {
  private remoteController = new RemoteController({
    webSocketClient,
    log: console,
    vehicle: config.vehicle,
  });

  public render() {
    return (
      <div className="view view--grid remote-view">
        <div className="joystick-grid">
          <div className="joystick-grid__item">
            <Joystick name="speed" onEvent={(name, event, info) => this.onJoystickEvent(name, event, info)} />
          </div>
          <div className="joystick-grid__item">
            <Joystick name="omega" onEvent={(name, event, info) => this.onJoystickEvent(name, event, info)} />
          </div>
        </div>
      </div>
    );
  }

  private onJoystickEvent(name: string, event: JoystickEvent, info: JoystickInstance) {
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
        this.remoteController.setSpeed(yPos * -1 / 100.0);
        break;

      case "omega":
        this.remoteController.setOmega(xPos / 100.0);
        break;

      default:
        throw new Error(`Got unexpected joystick "${name}" info`);
    }
  }
}
