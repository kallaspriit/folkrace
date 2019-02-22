import {
  create,
  EventData,
  Joystick as Nipple,
  JoystickEventTypes,
  JoystickManagerEventTypes,
  JoystickOutputData
} from "nipplejs";
import React from "react";

export interface JoystickProps {
  name: string;
  x?: boolean;
  y?: boolean;
  onEvent?(name: string, event: EventData, info: JoystickOutputData): void;
}

export class Joystick extends React.Component<JoystickProps> {
  private readonly ref = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const el = this.ref.current;

    // return if element could not be found
    if (!el) {
      console.warn("grid item dom node not found");

      return;
    }

    // create the nipple manager
    const manager = create({
      zone: el,
      color: "#FFF",
      size: 200,
      position: {
        left: "50%",
        top: "50%"
      },
      mode: "static",
      lockX: this.props.x === true,
      lockY: this.props.y === true
    });

    const { onEvent } = this.props;

    // only listen for events if even listener has been added
    if (typeof onEvent === "function") {
      const bind = "start,move,end,dir,plain" as JoystickManagerEventTypes;

      manager.on(bind, (event, nipple) => {
        onEvent(this.props.name, event, nipple);
      });
      manager.on("removed", (event, nipple) => {
        // @ts-ignore wrong typings
        nipple.off(bind);
      });
    }
  }

  render() {
    return <div className="joystick" ref={this.ref} />;
  }
}
