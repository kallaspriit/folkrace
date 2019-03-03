import { dummyLogger, Logger } from "ts-log";

export interface ManagedGamepadOptions {
  readonly index: number;
  readonly defaultDeadzone?: number;
  readonly log?: Logger;
}

export type HandleUpdateFn = (gamepad: ManagedGamepad) => void;

export class ManagedGamepad {
  index: number;
  axes: number[] = [];
  buttons: GamepadButton[] = [];
  private deadzone: number[] = [];
  private defaultDeadzone: number = 0;
  private readonly options: Required<ManagedGamepadOptions>;
  private readonly log: Logger;
  private updateListeners: HandleUpdateFn[] = [];
  private isPolling = false;
  private animationFrameRequest?: number;

  constructor(options: ManagedGamepadOptions) {
    this.options = {
      defaultDeadzone: 0,
      log: dummyLogger,
      ...options,
    };
    this.index = this.options.index;
    this.defaultDeadzone = this.options.defaultDeadzone;
    this.log = this.options.log;

    // get initial state
    this.poll();
  }

  setDeadzone(axisIndex: number, deadzone: number) {
    this.deadzone[axisIndex] = deadzone;
  }

  setDefaultDeadzone(deadzone: number) {
    this.defaultDeadzone = deadzone;
  }

  addUpdateListener(listener: HandleUpdateFn) {
    this.updateListeners.push(listener);
  }

  removeUpdateListener(listener: HandleUpdateFn) {
    this.updateListeners = this.updateListeners.filter(item => item !== listener);
  }

  startPolling() {
    if (!this.isPolling) {
      this.log.info(`starting polling of gamepad #${this.index}`);
    }

    // we're now in polling mode
    this.isPolling = true;

    // request animation frame for polling
    this.animationFrameRequest = requestAnimationFrame(() => {
      this.animationFrameRequest = undefined;

      // perform poll
      this.poll();

      // request another poll if not stopped
      if (this.isPolling) {
        this.startPolling();
      }
    });
  }

  stopPolling() {
    // do nothing if not polling
    if (!this.isPolling) {
      return;
    }

    // not polling any more
    this.isPolling = false;

    this.log.info(`stopping polling of gamepad #${this.index}`);

    // cancel next animation frame if scheduled
    if (this.animationFrameRequest !== undefined) {
      cancelAnimationFrame(this.animationFrameRequest);
    }
  }

  poll() {
    // get current gamepad info
    const gamepad = this.getCurrentState();

    // give up if not found
    if (!gamepad) {
      this.log.warn(`attempted to poll gamepad #${this.index} but the gamepad could not be found`);

      // stop polling unavailable gamepad
      if (this.isPolling) {
        this.stopPolling();
      }

      return;
    }

    // store current state
    this.axes = [...gamepad.axes];
    this.buttons = [...gamepad.buttons];

    // applies deadzone to axes
    this.applyDeadzone();

    // call the update listeners
    for (const updateListener of this.updateListeners) {
      updateListener(this);
    }
  }

  private getCurrentState() {
    // get gamepad by index
    const gamepad = navigator.getGamepads()[this.index];

    // return undefined if no valid gamepad could be found
    if (gamepad === undefined || gamepad === null) {
      return undefined;
    }

    return gamepad;
  }

  private applyDeadzone() {
    this.axes = this.axes.map((value, index) => {
      const deadzone = this.deadzone[index] !== undefined ? this.deadzone[index] : this.defaultDeadzone;

      if (Math.abs(value) < deadzone) {
        return 0;
      }

      return value;
    });
  }
}
