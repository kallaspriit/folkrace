export interface LidarMapOptions {
  wrap: HTMLDivElement;
  range: number;
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
  angle: number; // radians
  distance: number;
}

export interface DotOptions {
  size?: number;
  color?: string;
}

export type Coordinates = CartesianCoordinates | PolarCoordinates;

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
    this.setupTransforms();
    this.resetBackgroundStyles();
    this.resetMapStyles();
  }

  start() {
    this.isRunning = true;

    this.scheduleNextFrame();
  }

  destroy() {
    this.isRunning = false;
  }

  drawCircle(center: Coordinates, distance: number, ctx = this.map) {
    const pos = this.toScreen(center);

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, distance * this.getScale(), 0, Math.PI * 2);
    ctx.stroke();
  }

  drawDot(center: Coordinates, options: DotOptions = {}, ctx = this.map) {
    const pos = this.toScreen(center);
    const opt: Required<DotOptions> = {
      size: this.options.range / 100,
      color: "#FFF",
      ...options,
    };

    const screenSize = opt.size * this.getScale();

    ctx.save();
    ctx.fillStyle = opt.color;
    ctx.fillRect(pos.x - screenSize / 2, pos.y - screenSize / 2, screenSize, screenSize);
    ctx.restore();
  }

  polarToCartesian({ angle, distance }: PolarCoordinates): CartesianCoordinates {
    return {
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
    };
  }

  toCartesian(coordinates: Coordinates): CartesianCoordinates {
    if (this.isPolar(coordinates)) {
      return {
        x: coordinates.distance * Math.cos(coordinates.angle),
        y: coordinates.distance * Math.sin(coordinates.angle),
      };
    }

    // already cartesian
    return coordinates;
  }

  isPolar(coordinates: any): coordinates is PolarCoordinates {
    return typeof coordinates.angle === "number" && typeof coordinates.distance === "number";
  }

  toScreen(coordinates: Coordinates): CartesianCoordinates {
    const { x, y } = this.toCartesian(coordinates);
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

  resetBackgroundStyles() {
    this.bg.fillStyle = "#CCC";
    this.bg.strokeStyle = "#CCC";
    this.bg.lineWidth = 1;
  }

  resetMapStyles() {
    this.map.fillStyle = "#FFF";
    this.map.strokeStyle = "#FFF";
    this.map.lineWidth = 1;
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

  private setupTransforms() {
    // translate origins to the center of the canvas
    this.bg.translate(this.width / 2 + 0.5, this.height / 2 + 0.5);
    this.map.translate(this.width / 2 + 0.5, this.height / 2 + 0.5);

    // also rotate so that positive x is up
    this.bg.rotate(-Math.PI / 2);
    this.map.rotate(-Math.PI / 2);
  }
}
