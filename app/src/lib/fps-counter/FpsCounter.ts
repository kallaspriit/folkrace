export interface FpsCounterOptions {
  historySize?: number;
  averageSize?: number;
}

export class FpsCounter {
  private options: Required<FpsCounterOptions>;
  private frameDurations: number[] = [];
  private lastFrameTime?: number;

  constructor(options: FpsCounterOptions = {}) {
    this.options = {
      historySize: 60,
      averageSize: 60,
      ...options,
    };
  }

  update() {
    const currentTime = Date.now();

    if (!this.lastFrameTime) {
      this.lastFrameTime = currentTime;

      return;
    }

    const frameDuration = currentTime - this.lastFrameTime;

    this.frameDurations.push(frameDuration);

    if (this.frameDurations.length > this.options.historySize) {
      this.frameDurations.shift();
    }

    this.lastFrameTime = currentTime;
  }

  getFps() {
    const samples = this.frameDurations.slice(
      Math.max(this.frameDurations.length - this.options.averageSize, 0),
      this.frameDurations.length,
    );

    if (samples.length === 0) {
      return 0;
    }

    const sum = samples.reduce((result, frameDuration) => result + frameDuration, 0);
    const avg = sum / samples.length;
    const fps = 1000 / avg;

    return fps;
  }

  getHistory() {
    return this.frameDurations;
  }
}
