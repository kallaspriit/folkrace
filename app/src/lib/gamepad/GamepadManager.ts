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
  private options: Required<GamepadManagerOptions>;
  private log: Logger;
  private _handleGamepadConnected = this.handleGamepadConnected.bind(this);
  private _handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);

  constructor(options: GamepadManagerOptions = {}) {
    this.options = {
      log: dummyLogger,
      autoPoll: true,
      defaultDeadzone: 0,
      onConnect: (_gamepad) => {
        // nothing by default
      },
      onDisconnect: (_gamepad) => {
        // nothing by default
      },
      onUpdate: (_gamepad) => {
        // nothing by default
      },
      ...options,
    };
    this.log = this.options.log;

    // detect gamepad support
    if (typeof navigator.getGamepads !== "function") {
      this.log.info("gamepads are not supported");

      return;
    }

    // listen for gamepad connect events
    window.addEventListener("gamepadconnected", this._handleGamepadConnected);

    // listen for gamepad disconnect events
    window.addEventListener("gamepaddisconnected", this._handleGamepadDisconnected);

    const gamepads = Array.from(navigator.getGamepads());

    gamepads.forEach((gamepad) => {
      if (!gamepad) {
        return;
      }

      this.handleGamepadConnected(({
        gamepad: gamepad,
      } as unknown) as Event);
    });
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

    // create managed gamepad
    const managedGamepad = new ManagedGamepad({
      index: gamepad.index,
      defaultDeadzone: this.options.defaultDeadzone,
      log: this.log,
    });

    // listen for updates, trigger update events
    managedGamepad.addUpdateListener((updatedGamepad) => this.options.onUpdate(updatedGamepad));

    // start polling if requested automatically
    if (this.options.autoPoll) {
      managedGamepad.startPolling();
    }

    // store reference
    this.gamepads.push(managedGamepad);

    // trigger connect event
    this.options.onConnect(managedGamepad);
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

    // trigger disconnect event
    this.options.onDisconnect(managedGamepad);
  }

  getGamepadByIndex(index: number) {
    return this.gamepads.find((gamepad) => gamepad.index === index);
  }

  getFirstAvailableGamepad() {
    return this.gamepads.length > 0 ? this.gamepads[0] : undefined;
  }
}
