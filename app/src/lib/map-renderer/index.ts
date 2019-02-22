export interface LidarMapOptions {
  wrap: HTMLDivElement;
  range: number;
  step?: number;
  rotation?: number;
  // measurements: () => PolarMeasurement[]; // TODO: support cartesian measurements
  // TODO: support controlling when to update
  render(self: MapRenderer, info: FrameInfo): void;
}

export interface FrameInfo {
  time: number;
  dt: number;
  frame: number;
}

export interface PolarMeasurement extends PolarCoordinates {
  readonly quality?: number;
  // readonly timestamp: number;
  [x: string]: any;
}

export interface CartesianCoordinates {
  x: number;
  y: number;
}

export interface PolarCoordinates {
  angle: number;
  distance: number;
}

export class MapRenderer {
  readonly options: Required<LidarMapOptions>;
  readonly bg: CanvasRenderingContext2D;
  readonly map: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly size: number;
  private isRunning = false;
  private frameNumber = 0;
  private lastRenderTime?: number;

  constructor(options: LidarMapOptions) {
    this.options = {
      rotation: 0,
      step: options.range / 4,
      ...options,
    };

    // create the canvas elements for background and the map
    const backgroundCanvas = this.createCanvasElement();
    const mapCanvas = this.createCanvasElement();

    // append the canvas elements
    this.options.wrap.append(backgroundCanvas, mapCanvas);

    // get actual effective dimensions
    this.width = backgroundCanvas.offsetWidth;
    this.height = backgroundCanvas.offsetHeight;

    // use minimum of width/height as size
    this.size = Math.min(this.width, this.height) - 2;

    // set fixed canvas element dimensions
    backgroundCanvas.setAttribute("width", `${this.width.toString()}px`);
    backgroundCanvas.setAttribute("height", `${this.height.toString()}px`);
    mapCanvas.setAttribute("width", `${this.width.toString()}px`);
    mapCanvas.setAttribute("height", `${this.height.toString()}px`);

    // get contexts
    const backgroundContext = backgroundCanvas.getContext("2d");
    const mapContext = mapCanvas.getContext("2d");

    // throw error if contexts could not be acquired
    if (!backgroundContext) {
      throw new Error("Failed to get background canvas 2d context");
    }

    if (!mapContext) {
      throw new Error("Failed to get background canvas 2d context");
    }

    // store context references
    this.bg = backgroundContext;
    this.map = mapContext;

    // perform initial setup
    this.setupTranslation();
    this.setupBackgroundStyles();
    this.setupMapStyles();
  }

  start() {
    this.isRunning = true;

    this.renderBackground();
    this.scheduleNextFrame();
  }

  destroy() {
    this.isRunning = false;
  }

  drawCircle(center: CartesianCoordinates, distance: number, ctx = this.map) {
    const screen = this.cartesianToScreen(center);

    ctx.beginPath();
    ctx.arc(screen.x, screen.y, distance * this.getScale(), 0, Math.PI * 2);
    ctx.stroke();
  }

  drawPolarDot(polarCoordinates: PolarCoordinates, ctx = this.map) {
    const cartesianCoordinates = this.polarToCartesian(polarCoordinates, true);
    const screenCoordinates = this.cartesianToScreen(cartesianCoordinates);

    const size = 5;

    ctx.fillRect(screenCoordinates.x - size / 2, screenCoordinates.y - size / 2, size, size);
  }

  polarToCartesian({ angle, distance }: PolarCoordinates, convertsDegrees: boolean): CartesianCoordinates {
    const convertedAngle = convertsDegrees ? this.toRadians(angle) : angle;

    return {
      x: distance * Math.cos(convertedAngle + this.options.rotation),
      y: distance * Math.sin(convertedAngle + this.options.rotation),
    };
  }

  cartesianToScreen({ x, y }: CartesianCoordinates): CartesianCoordinates {
    const scale = this.getScale();

    return {
      x: x * scale,
      y: y * scale,
    };
  }

  getScale() {
    return this.size / 2 / this.options.range;
  }

  toRadians(angleDegrees: number) {
    return angleDegrees * (Math.PI / 180);
  }

  clear(ctx = this.map) {
    ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }

  private renderBackground() {
    for (let distance = this.options.step; distance <= this.options.range; distance += this.options.step) {
      this.drawCircle({ x: 0, y: 0 }, distance, this.bg);
    }
  }

  private renderFrame(time: number) {
    if (!this.isRunning) {
      return;
    }

    const currentTime = Date.now();
    const dt = (this.lastRenderTime ? currentTime - this.lastRenderTime : 16) / 1000;

    this.options.render(this, {
      dt,
      time,
      frame: this.frameNumber++,
    });

    this.lastRenderTime = currentTime;
  }

  private scheduleNextFrame() {
    window.requestAnimationFrame(newTime => {
      if (!this.isRunning) {
        return;
      }

      this.renderFrame(newTime);
      this.scheduleNextFrame();
    });
  }

  private createCanvasElement() {
    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.left = "0";
    canvas.style.right = "0";

    return canvas;
  }

  private setupTranslation() {
    // translate origins to the center of the canvas
    this.bg.translate(this.width / 2 + 0.5, this.height / 2 + 0.5);
    this.map.translate(this.width / 2 + 0.5, this.height / 2 + 0.5);
  }

  private setupBackgroundStyles() {
    this.bg.fillStyle = "#CCC";
    this.bg.strokeStyle = "#CCC";
    this.bg.lineWidth = 1;
  }

  private setupMapStyles() {
    this.map.fillStyle = "#FFF";
    this.map.strokeStyle = "#FFF";
    this.map.lineWidth = 1;
  }
}
