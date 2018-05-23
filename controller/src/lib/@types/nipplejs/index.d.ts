declare module "nipplejs" {
  export interface JoystickPosition {
    top: string;
    left: string;
  }

  type JoystickMode = "dynamic" | "semi" | "static";

  export interface JoystickOptions {
    zone?: HTMLElement;
    color?: string;
    size?: number;
    threshold?: number;
    fadeTime?: number;
    multitouch?: boolean;
    maxNumberOfNipples?: number;
    dataOnly?: boolean;
    position?: JoystickPosition;
    mode?: JoystickMode;
    restJoystick?: boolean;
    restOpacity?: number;
    catchDistance?: number;
  }

  export type JoystickEventName =
    | "added"
    | "removed"
    | "start"
    | "end"
    | "move"
    | "dir"
    | "plain"
    | "shown"
    | "hidden"
    | "destroyed"
    | "pressure"
    | string;

  export interface JoystickEvent {
    type: JoystickEventName;
    target: any;
  }

  export type JoystickDirectionX = "left" | "right";
  export type JoystickDirectionY = "up" | "down";
  export type JoystickDirection = JoystickDirectionX | JoystickDirectionY;

  export type JoystickEventCallback = (event: JoystickEvent, nipple: JoystickInstance) => void;

  export interface JoystickInstance {
    angle: {
      radian: number;
      degree: number;
    };
    direction: {
      x: JoystickDirectionX;
      y: JoystickDirectionY;
      angle: JoystickDirection;
    };
    distance: number;
    force: number;
    identifier: number;
    position: {
      x: number;
      y: number;
    };
    pressure: number;
    instance: any;

    on(event: JoystickEventName, cb: JoystickEventCallback): JoystickInstance;
    off(event: JoystickEventName): JoystickInstance;
  }

  export function create(options: JoystickOptions): JoystickInstance;
}
