export interface LidarMapOptions {
  wrap: HTMLDivElement;
  range: number;
  onMouseDown?(event: MapMouseEvent): void;
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

export interface DrawOptions {
  color?: string | CanvasGradient | CanvasPattern;
}

export interface DrawDotOptions extends DrawOptions {
  size?: number;
}

export type MapMouseEventType = "down" | "up";

export interface MapMouseEvent {
  type: MapMouseEventType;
  screen: CartesianCoordinates;
  world: CartesianCoordinates;
}

export type Coordinates = CartesianCoordinates | PolarCoordinates;

export class MapRenderer {
  readonly options: Required<LidarMapOptions>;
  readonly bg: CanvasRenderingContext2D;
  readonly map: CanvasRenderingContext2D;
  readonly bgCanvas: HTMLCanvasElement;
  readonly mapCanvas: HTMLCanvasElement;
  width: number;
  height: number;
  size: number;
  private isRunning = false;
  private frameNumber = 0;
  private lastRenderTime?: number;

  constructor(options: LidarMapOptions) {
    this.options = {
      onMouseDown: () => {
        /* do nothing */
      },
      ...options,
    };

    // create the canvas elements for background and the map
    this.bgCanvas = this.createCanvasElement();
    this.mapCanvas = this.createCanvasElement();

    // handle mouse down events
    // TODO: move to method, handle up, move
    this.mapCanvas.onmousedown = event => {
      const screenOrigin = this.getScreenOrigin();
      const screen = {
        x: -event.y + screenOrigin.y,
        y: event.x - screenOrigin.x,
      };
      const world = this.toWorld(screen);

      console.log("RAW", event.x, event.y);

      this.options.onMouseDown({
        type: "down",
        screen,
        world,
      });
    };

    // append the canvas elements
    this.options.wrap.append(this.bgCanvas, this.mapCanvas);

    // get actual effective dimensions
    this.width = this.bgCanvas.offsetWidth;
    this.height = this.bgCanvas.offsetHeight;

    // use minimum of width/height as size
    this.size = Math.min(this.width, this.height) - 2;

    // set fixed canvas element dimensions
    this.bgCanvas.setAttribute("width", `${this.width.toString()}px`);
    this.bgCanvas.setAttribute("height", `${this.height.toString()}px`);
    this.mapCanvas.setAttribute("width", `${this.width.toString()}px`);
    this.mapCanvas.setAttribute("height", `${this.height.toString()}px`);

    // get contexts
    const backgroundContext = this.bgCanvas.getContext("2d");
    const mapContext = this.mapCanvas.getContext("2d");

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

    // TODO: wrong size is calculated for canvas height
    // const currentWidth = this.bgCanvas.offsetWidth;
    // const currentHeight = this.bgCanvas.offsetHeight;

    // console.log("width", this.width, currentWidth);
    // console.log("height", this.height, currentHeight);

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

  drawDot(center: Coordinates, options: DrawDotOptions = {}, ctx = this.map) {
    const opt: Required<DrawDotOptions> = {
      size: this.options.range / 100,
      color: "#FFF",
      ...options,
    };
    const screenCenter = this.toScreen(center);
    const screenSize = opt.size * this.getScale();

    ctx.save();
    ctx.fillStyle = opt.color;
    ctx.fillRect(screenCenter.x - screenSize / 2, screenCenter.y - screenSize / 2, screenSize, screenSize);
    ctx.restore();
  }

  drawLine(from: Coordinates, to: Coordinates, options: DrawOptions = {}, ctx = this.map) {
    const opt: Required<DrawOptions> = {
      color: "#FFF",
      ...options,
    };
    const screenFrom = this.toScreen(from);
    const screenTo = this.toScreen(to);

    ctx.save();
    ctx.fillStyle = opt.color;
    ctx.moveTo(screenFrom.x, screenFrom.y);
    ctx.lineTo(screenTo.x, screenTo.y);
    ctx.stroke();
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

  toScreen(world: Coordinates): CartesianCoordinates {
    const { x, y } = this.toCartesian(world);
    const scale = this.getScale();

    return {
      x: x * scale,
      y: y * scale,
    };
  }

  toWorld(screen: Coordinates): CartesianCoordinates {
    const { x, y } = this.toCartesian(screen);
    const scale = this.getScale();

    return {
      x: x / scale,
      y: y / scale,
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
    const screenOrigin = this.getScreenOrigin();

    // translate origins to the center of the canvas
    this.bg.translate(screenOrigin.x, screenOrigin.y);
    this.map.translate(screenOrigin.x, screenOrigin.y);

    // also rotate so that positive x is up
    this.bg.rotate(-Math.PI / 2);
    this.map.rotate(-Math.PI / 2);
  }

  private getScreenOrigin(): CartesianCoordinates {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }
}
