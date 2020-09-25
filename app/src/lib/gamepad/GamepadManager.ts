import { dummyLogger, Logger } from "ts-log";

import { ManagedGamepad } from "./";

export interface GamepadManagerOptions {
  readonly log?: Logger;
  readonly autoPoll?: boolean;
  readonly defaultDeadzone?: number;
  onConnect?(gamepad: ManagedGamepad): void;
  onDisconnect?(gamepad: ManagedGamepad): void;
  onUpdate?(gamepad: ManagedGamepad): void;
}

export class GamepadManager {
  gamepads: ManagedGamepad[] = [];
  private _handleGamepadConnected = this.handleGamepadConnected.bind(this);
  private _handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);

  constructor(private options: GamepadManagerOptions = {}) {
    // detect gamepad support
    if (typeof navigator.getGamepads !== "function") {
      this.log.info("gamepads are not supported");

      return;
    }

    // listen for gamepad connect events
    window.addEventListener("gamepadconnected", this._handleGamepadConnected);

    // listen for gamepad disconnect events
    window.addEventListener("gamepaddisconnected", this._handleGamepadDisconnected);

    // get existing gamepads
    const gamepads = Array.from(navigator.getGamepads());

    // register existing gamepads
    gamepads.forEach((gamepad) => {
      if (!gamepad) {
        return;
      }

      this.handleGamepadConnected(({
        gamepad: gamepad,
      } as unknown) as Event);
    });
  }

  get log() {
    if (!this.options.log) {
      return dummyLogger;
    }

    return this.options.log;
  }

  destroy() {
    // remove event listeners
    window.removeEventListener("gamepadconnected", this._handleGamepadConnected);
    window.removeEventListener("gamepaddisconnected", this._handleGamepadDisconnected);

    // stop polling gamepads
    this.gamepads.forEach((gamepad) => gamepad.stopPolling());
  }

  handleGamepadConnected(e: Event) {
    const event = e as GamepadEvent;
    const gamepad = event.gamepad;

    this.log.info(
      `gamepad #${gamepad.index} "${gamepad.id}" connected (${gamepad.buttons.length} buttons, ${gamepad.axes.length} axes)`,
    );

    // use provided deadzone if available, otherwise calculate default deadzone
    const defaultDeadzone =
      this.options.defaultDeadzone !== undefined
        ? this.options.defaultDeadzone
        : GamepadManager.getAutoDeadzone([...gamepad.axes]);

    console.log({ defaultDeadzone });

    // create managed gamepad
    const managedGamepad = new ManagedGamepad({
      id: gamepad.id,
      index: gamepad.index,
      defaultDeadzone,
      log: this.log,
    });

    // store reference
    this.gamepads.push(managedGamepad);

    const { onConnect, onUpdate, autoPoll = true } = this.options;

    // trigger connect event
    if (onConnect) {
      onConnect(managedGamepad);
    }

    // listen for updates, trigger update events
    if (onUpdate) {
      managedGamepad.addUpdateListener(onUpdate);
    }

    // start polling if requested automatically
    if (autoPoll) {
      managedGamepad.startPolling();
    }
  }

  handleGamepadDisconnected(e: Event) {
    const event = e as GamepadEvent;
    const gamepad = event.gamepad;

    // attempt to find the gamepad by index
    const managedGamepad = this.getGamepadByIndex(gamepad.index);

    // handle failure to find the gamepad
    if (!managedGamepad) {
      this.log.warn(
        `gamepad #${gamepad.index} "${gamepad.id}" disconnected but no managed gamepad with this index was found, this should not happen`,
      );

      return;
    }

    this.log.info(`gamepad #${gamepad.index} "${gamepad.id}" disconnected`);

    // remove the gamepad from the list of managed gamepads
    this.gamepads = this.gamepads.filter((item) => item !== managedGamepad);

    // stop polling
    managedGamepad.stopPolling();

    const { onDisconnect } = this.options;

    // trigger disconnect event
    if (onDisconnect) {
      onDisconnect(managedGamepad);
    }
  }

  static getAutoDeadzone(axes: number[], multiplier = 1.5) {
    let maxAxisValue = 0;

    axes.forEach((axisValue) => {
      const absValue = Math.abs(axisValue);

      if (absValue > maxAxisValue) {
        maxAxisValue = absValue;
      }
    });

    // add some headroom as current offset might not be the worst possible
    return maxAxisValue * multiplier;
  }

  getGamepadByIndex(index: number) {
    return this.gamepads.find((gamepad) => gamepad.index === index);
  }

  getFirstAvailableGamepad() {
    return this.gamepads.length > 0 ? this.gamepads[0] : undefined;
  }
}
