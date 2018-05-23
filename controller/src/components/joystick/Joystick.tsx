import * as nipplejs from "nipplejs";
import * as React from "react";
export { JoystickEvent, JoystickInstance, JoystickEventName } from "nipplejs";

export interface JoystickProps {
  name: string;
  config?: nipplejs.JoystickOptions;
  bind?: string;
  onEvent?(name: string, event: nipplejs.JoystickEvent, info: nipplejs.JoystickInstance): void;
}

export default class Joystick extends React.Component<JoystickProps> {
  private ref = React.createRef<HTMLDivElement>();

  public componentDidMount() {
    const el = this.ref.current;

    // return if element could not be found
    if (!el) {
      console.warn("grid item dom node not found");

      return;
    }

    // create the nipple manager
    const manager = nipplejs.create({
      zone: el,
      color: "#FFF",
      size: 200,
      position: {
        left: "50%",
        top: "50%",
      },
      mode: "static",
    });

    const { onEvent } = this.props;

    // only listen for events if even listener has been added
    if (typeof onEvent === "function") {
      const bind = this.props.bind ? this.props.bind : "start move end dir plain";

      manager
        .on(bind, (event, nipple) => {
          onEvent(this.props.name, event, nipple);
        })
        .on("removed", (_event, nipple) => {
          nipple.off(bind);
        });
    }
  }

  public render() {
    return <div className="joystick" ref={this.ref} />;
  }
}
