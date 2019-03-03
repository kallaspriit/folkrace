import { dummyLogger, Logger } from "ts-log";

export interface TickerOptions {
  readonly autoStart?: boolean;
  readonly log?: Logger;
  tick(info: TickInfo): void;
}

export interface TickInfo {
  dt: number;
  time: number;
  frame: number;
}

export class Ticker {
  private readonly options: Required<TickerOptions>;
  private readonly log: Logger;
  private isRunning = false;
  private frameNumber = 0;
  private scheduledAnimationFrame?: number;
  private lastTickTime?: number;

  constructor(options: TickerOptions) {
    this.options = {
      autoStart: false,
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;

    if (this.options.autoStart) {
      this.start();
    }
  }

  start() {
    this.log.info("starting");

    this.isRunning = true;

    this.scheduleNextFrame();
  }

  stop() {
    this.log.info("stopping");

    this.isRunning = false;

    if (this.scheduledAnimationFrame !== undefined) {
      cancelAnimationFrame(this.scheduledAnimationFrame);

      this.scheduledAnimationFrame = undefined;
    }
  }

  tick() {
    if (!this.isRunning) {
      return;
    }

    const currentTime = Date.now();
    const dt = (this.lastTickTime ? currentTime - this.lastTickTime : 16) / 1000;

    this.options.tick({
      dt,
      time: currentTime,
      frame: this.frameNumber++,
    });

    this.lastTickTime = currentTime;
  }

  private scheduleNextFrame() {
    this.scheduledAnimationFrame = window.requestAnimationFrame(newTime => {
      this.scheduledAnimationFrame = undefined;

      if (!this.isRunning) {
        return;
      }

      this.tick();
      this.scheduleNextFrame();
    });
  }
}
