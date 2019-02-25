import Vector from "victor";

export interface MapRendererOptions {
  wrap: HTMLDivElement;
  range: number;
  padding?: number;
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

export type ColorStyle = string | CanvasGradient | CanvasPattern;

export interface DrawStyle {
  color?: ColorStyle;
  fillStyle?: ColorStyle;
  strokeStyle?: ColorStyle;
  lineWidth?: number;
  font?: string;
  textAlign?: CanvasTextAlign;
}

export interface DrawCircleOptions {
  center?: Coordinates;
  radius: number;
}

export interface DrawDotOptions {
  center: Coordinates;
  size?: number;
}

// TODO: support center, angle, length
export interface DrawLineOptions {
  from: Coordinates;
  to: Coordinates;
}

export interface DrawTextOptions {
  origin: Coordinates;
  text: string;
}

export interface DrawArrowOptions extends DrawLineOptions {
  tipSize?: number;
  name?: string;
}

export interface DrawDirectionOptions {
  center: Coordinates;
  angle: number;
  size?: number;
  name?: string;
}

export interface DrawGridOptions {
  center?: Coordinates;
  cellWidth: number;
  cellHeight: number;
  rows: number;
  columns: number;
}

export interface DrawCoordinateSystemOptions {
  center?: Coordinates;
  length?: number;
}

export type MapMouseEventType = "down" | "up";

export interface MapMouseEvent {
  type: MapMouseEventType;
  screen: CartesianCoordinates;
  world: CartesianCoordinates;
}

export type Coordinates = CartesianCoordinates | PolarCoordinates;

export class MapRenderer {
  readonly options: Required<MapRendererOptions>;
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

  constructor(options: MapRendererOptions) {
    this.options = {
      padding: options.range / 10,
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
    this.setupDefaultStyle();
  }

  start() {
    this.isRunning = true;

    this.scheduleNextFrame();
  }

  destroy() {
    this.isRunning = false;
  }

  drawCircle(options: DrawCircleOptions, style: DrawStyle = { strokeStyle: "#666" }, ctx = this.map) {
    const opt: Required<DrawCircleOptions> = {
      center: { x: 0, y: 0 },
      ...options,
    };
    const screenCenter = this.toScreen(opt.center);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.beginPath();
    ctx.arc(screenCenter.x, screenCenter.y, this.scale(opt.radius), 0, Math.PI * 2);

    if (style.fillStyle) {
      ctx.fill();
    }

    if (style.strokeStyle) {
      ctx.stroke();
    }

    ctx.restore();
  }

  drawDot(options: DrawDotOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawDotOptions> = {
      size: this.options.range / 50,
      ...options,
    };
    const angle = this.isPolar(opt.center) ? opt.center.angle : 0;
    const screenCenter = this.toScreen(opt.center);
    const screenSize = this.scale(opt.size);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.translate(screenCenter.x, screenCenter.y);
    ctx.rotate(angle);
    ctx.fillRect(-screenSize / 2, -screenSize / 2, screenSize, screenSize);

    ctx.restore();
  }

  drawLine(options: DrawLineOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawLineOptions> = {
      ...options,
    };
    const screenFrom = this.toScreen(opt.from);
    const screenTo = this.toScreen(opt.to);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.beginPath();
    ctx.moveTo(screenFrom.x, screenFrom.y);
    ctx.lineTo(screenTo.x, screenTo.y);
    ctx.stroke();

    ctx.restore();
  }

  drawGrid(options: DrawGridOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawGridOptions> = {
      center: { x: 0, y: 0 },
      ...options,
    };

    const screenCellWidth = this.scale(opt.cellWidth);

    for (let row = 0; row < opt.rows; row++) {
      const rowX = row * screenCellWidth;

      this.drawLine(
        {
          from: {
            x: rowX,
            y: 0,
          },
          to: {
            x: rowX,
            y: 100,
          },
        },
        style,
        ctx,
      );
    }
  }

  drawArrow(options: DrawArrowOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawArrowOptions> = {
      tipSize: this.options.range / 50,
      name: "",
      ...options,
    };

    this.drawLine({ ...opt }, style, ctx);

    const screenFrom = this.toScreen(opt.from);
    const screenTo = this.toScreen(opt.to);
    const directionVector = Vector.fromObject(screenTo).subtract(Vector.fromObject(screenFrom));
    const angle = directionVector.angle();

    this.drawDirection(
      {
        ...opt,
        center: opt.to,
        angle,
        size: opt.tipSize,
      },
      style,
      ctx,
    );
  }

  drawDirection(options: DrawDirectionOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawDirectionOptions> = {
      size: this.options.range / 50,
      name: "",
      ...options,
    };

    const screenCenter = this.toScreen(opt.center);
    const screenSize = this.scale(opt.size);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.translate(screenCenter.x, screenCenter.y);
    ctx.rotate(opt.angle);
    ctx.beginPath();
    ctx.moveTo(-screenSize / 2, screenSize / 2);
    ctx.lineTo(-screenSize / 2, -screenSize / 2);
    ctx.lineTo(0, 0);
    ctx.lineTo(-screenSize / 2, screenSize / 2);
    ctx.fill();

    ctx.restore();

    if (opt.name.length > 0) {
      const origin = this.toCartesian(opt.center);
      origin.x += opt.size;

      this.drawText({ origin, text: opt.name }, style, ctx);
    }
  }

  drawText(options: DrawTextOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawTextOptions> = {
      ...options,
    };

    const screenOrigin = this.toScreen(opt.origin);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.translate(screenOrigin.x, screenOrigin.y);
    ctx.rotate(Math.PI / 2);
    ctx.scale(-1, 1);
    ctx.fillText(opt.text, 0, 0);
    ctx.restore();
  }

  drawCoordinateSystem(options: DrawCoordinateSystemOptions = {}, ctx = this.map) {
    const opt: Required<DrawCoordinateSystemOptions> = {
      center: { x: -this.options.range, y: this.options.range },
      length: this.options.range / 10,
      ...options,
    };
    const center = Vector.fromObject(this.toCartesian(opt.center));

    const toX = center.clone().add(new Vector(opt.length, 0));
    const toY = center.clone().add(new Vector(0, opt.length));

    this.drawArrow({ from: opt.center, to: toX, name: "X" }, { lineWidth: 2, color: "#F00", textAlign: "center" }, ctx);
    this.drawArrow({ from: opt.center, to: toY, name: "Y" }, { lineWidth: 2, color: "#0F0", textAlign: "center" }, ctx);
  }

  polarToCartesian({ angle, distance }: PolarCoordinates): CartesianCoordinates {
    return {
      x: distance * Math.cos(angle),
      y: distance * Math.sin(angle),
    };
  }

  toCartesian(coordinates: Coordinates): CartesianCoordinates {
    if (this.isPolar(coordinates)) {
      const angleCorrection = Math.PI / 2;

      return {
        x: coordinates.distance * Math.cos(coordinates.angle + angleCorrection),
        y: coordinates.distance * Math.sin(coordinates.angle + angleCorrection),
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

    return {
      x: this.scale(x),
      y: this.scale(y),
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
    return this.size / 2 / (this.options.range + this.options.padding);
  }

  scale(distance: number) {
    return distance * this.getScale();
  }

  toRadians(angleDegrees: number) {
    return angleDegrees * (Math.PI / 180);
  }

  clear(ctx = this.map) {
    ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
  }

  setupDefaultStyle() {
    const defaultStyle: DrawStyle = {
      fillStyle: "#000",
      strokeStyle: "#000",
      font: "16px monospace",
    };

    this.applyStyle(defaultStyle, this.bg);
    this.applyStyle(defaultStyle, this.map);
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

  private applyStyle(options: DrawStyle, ctx = this.map) {
    if (options.color) {
      ctx.strokeStyle = options.color;
      ctx.fillStyle = options.color;
    }

    if (options.strokeStyle) {
      ctx.strokeStyle = options.strokeStyle;
    }

    if (options.fillStyle) {
      ctx.fillStyle = options.fillStyle;
    }

    if (options.lineWidth) {
      ctx.lineWidth = options.lineWidth;
    }

    if (options.font) {
      ctx.font = options.font;
    }

    if (options.textAlign) {
      ctx.textAlign = options.textAlign;
    }
  }

  private setupTransforms() {
    const screenOrigin = this.getScreenOrigin();

    // translate origins to the center of the canvas
    // this.bg.translate(screenOrigin.x, screenOrigin.y);
    // this.map.translate(screenOrigin.x, screenOrigin.y);

    const scale = {
      horizontal: -1,
      vertical: 1,
    };
    const rotation = -Math.PI / 2;

    this.bg.transform(scale.horizontal, 0, 0, scale.vertical, screenOrigin.x, screenOrigin.y);
    this.map.transform(scale.horizontal, 0, 0, scale.vertical, screenOrigin.x, screenOrigin.y);

    // by the right hand rule, the yaw component of orientation increases as the child frame rotates counter-clockwise,
    // and for geographic poses, yaw is zero when pointing east.
    this.bg.rotate(rotation);
    this.map.rotate(rotation);
  }

  private getScreenOrigin(): CartesianCoordinates {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }
}
