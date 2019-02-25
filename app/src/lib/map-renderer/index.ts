import color from "color";
import Vector from "victor";

import { map } from "../../services/map";

export interface MapRendererOptions {
  wrap: HTMLDivElement;
  radius: number;
  padding?: number;
  scale?: {
    horizontal: number;
    vertical: number;
  };
  rotation?: number;
  onMouseEvent?(event: MapMouseEvent): void;
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
  textBaseline?: CanvasTextBaseline;
}

export interface DrawCircleOptions {
  center?: Coordinates;
  radius: number;
}

export interface DrawPulseOptions {
  center?: Coordinates;
  lifetime?: number;
  age?: number;
  size?: number;
}

export interface DrawMarkerOptions {
  center: Coordinates;
  size?: number;
}

export interface DrawBoxOptions {
  origin: Coordinates;
  width: number;
  height: number;
  padding?: number;
}

// TODO: support center, angle, length
export interface DrawLineOptions {
  from: Coordinates;
  to: Coordinates;
}

export interface DrawTextOptions {
  origin: Coordinates;
  text: string;
  offset?: CartesianCoordinates;
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
  cellWidth: number;
  cellHeight: number;
  rows: number;
  columns: number;
  center?: Coordinates;
}

export interface DrawOccupancyGridOptions {
  cellWidth: number;
  cellHeight: number;
  grid: OccupancyGrid;
  path?: Path;
  center?: Coordinates;
}

export interface DrawCoordinateSystemOptions {
  center?: Coordinates;
  length?: number;
}

export type OccupancyGrid = number[][];

export type Cell = [number, number];

export type Path = Cell[];

export type MapMouseEventType = "down" | "up" | "move";

export interface MapMouseEvent {
  type: MapMouseEventType;
  screen: CartesianCoordinates;
  world: CartesianCoordinates;
  isMouseDown: boolean;
  event: MouseEvent;
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
  private frameNumber = 0;
  private lastRenderTime?: number;
  private isRunning = false;
  private mouseDownCounter = 0;

  constructor(options: MapRendererOptions) {
    this.options = {
      padding: options.radius / 10,
      scale: {
        horizontal: 1,
        vertical: 1,
      },
      rotation: 0,
      onMouseEvent: () => {
        /* do nothing */
      },
      ...options,
    };

    // create the canvas elements for background and the map
    this.bgCanvas = this.createCanvasElement();
    this.mapCanvas = this.createCanvasElement();

    // handle mouse events
    this.mapCanvas.onmousedown = event => this.handleMouseEvent("down", event);
    this.mapCanvas.onmouseup = event => this.handleMouseEvent("up", event);
    this.mapCanvas.onmousemove = event => this.handleMouseEvent("move", event);

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

  drawCircle(options: DrawCircleOptions, style: DrawStyle = { strokeStyle: "#000" }, ctx = this.map) {
    const opt: Required<DrawCircleOptions> = {
      center: { x: 0, y: 0 },
      ...options,
    };
    const screenCenter = this.worldToScreen(opt.center);

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

  drawPulse(options: DrawPulseOptions, style: DrawStyle = { strokeStyle: "#000" }, ctx = this.map) {
    const opt: Required<DrawPulseOptions> = {
      center: { x: 0, y: 0 },
      lifetime: 300,
      age: 0,
      size: this.options.radius / 10,
      ...options,
    };

    // don't draw dead pulses
    if (opt.age > opt.lifetime) {
      return;
    }

    const opacity = map(opt.age, 0, opt.lifetime, 1, 0);
    const fillStyle = color(style.fillStyle || "#F00")
      .alpha(opacity)
      .toString();

    this.drawCircle(
      {
        center: opt.center,
        radius: map(opt.age, 0, opt.lifetime, opt.size / 10, opt.size),
      },
      {
        fillStyle,
      },
    );
  }

  drawMarker(options: DrawMarkerOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawMarkerOptions> = {
      size: this.options.radius / 50,
      ...options,
    };
    const angle = this.isPolar(opt.center) ? opt.center.angle : 0;
    const screenCenter = this.worldToScreen(opt.center);
    const screenSize = this.scale(opt.size);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.translate(screenCenter.x, screenCenter.y);
    ctx.rotate(angle);
    ctx.fillRect(-screenSize / 2, -screenSize / 2, screenSize, screenSize);

    ctx.restore();
  }

  drawBox(options: DrawBoxOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawBoxOptions> = {
      padding: 0,
      ...options,
    };
    const screenOrigin = this.worldToScreen(opt.origin);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.fillRect(
      screenOrigin.x + opt.padding,
      screenOrigin.y + opt.padding,
      this.scale(opt.width) - opt.padding * 2,
      this.scale(opt.height) - opt.padding * 2,
    );

    ctx.restore();
  }

  drawLine(options: DrawLineOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawLineOptions> = {
      ...options,
    };
    const screenFrom = this.worldToScreen(opt.from);
    const screenTo = this.worldToScreen(opt.to);

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

    const gridHeight = opt.cellHeight * opt.rows;
    const gridWidth = opt.cellWidth * opt.columns;

    for (let row = 0; row <= opt.rows; row++) {
      const rowX = row * opt.cellHeight;

      this.drawLine(
        {
          from: {
            x: -gridHeight / 2 + rowX,
            y: -gridWidth / 2,
          },
          to: {
            x: -gridHeight / 2 + rowX,
            y: gridWidth / 2,
          },
        },
        style,
        ctx,
      );
    }

    for (let column = 0; column <= opt.columns; column++) {
      const columnY = column * opt.cellWidth;

      this.drawLine(
        {
          from: {
            x: -gridHeight / 2,
            y: -gridWidth / 2 + columnY,
          },
          to: {
            x: gridHeight / 2,
            y: -gridWidth / 2 + columnY,
          },
        },
        style,
        ctx,
      );
    }
  }

  drawOccupancyGrid(options: DrawOccupancyGridOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawOccupancyGridOptions> = {
      center: { x: 0, y: 0 },
      path: [],
      ...options,
    };

    // don't attempt to draw an empty map
    if (opt.grid.length === 0) {
      return;
    }

    const rows = opt.grid.length;
    const columns = opt.grid[0].length;
    const gridHeight = opt.cellHeight * rows;
    const gridWidth = opt.cellWidth * columns;

    // draw grid
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        if (!Array.isArray(opt.grid[row])) {
          throw new Error(`Expected occupancy map row #${row} to be an array, got ${typeof opt.grid[row]}`);
        }

        const occupancy = opt.grid[row][column];

        if (typeof occupancy !== "number") {
          throw new Error(`Expected occupancy map row cell ${row}x${column} to be a number, got ${typeof occupancy}`);
        }

        // don't draw empty or unknown cells
        if (occupancy <= 0) {
          continue;
        }

        const origin = {
          x: column * opt.cellWidth - gridWidth / 2,
          y: row * opt.cellHeight - gridHeight / 2,
        };

        this.drawBox(
          { origin, width: opt.cellWidth, height: opt.cellHeight, padding: 1 },
          { fillStyle: `rgba(0, 0, 0, ${occupancy})` },
          ctx,
        );
      }
    }

    // draw path
    for (const [column, row] of opt.path) {
      const origin = {
        x: column * opt.cellWidth - gridWidth / 2,
        y: row * opt.cellHeight - gridHeight / 2,
      };

      this.drawBox(
        { origin, width: opt.cellWidth, height: opt.cellHeight, padding: 1 },
        { fillStyle: "rgba(0, 255, 0, 0.2)" },
        ctx,
      );
    }
  }

  drawArrow(options: DrawArrowOptions, style: DrawStyle = {}, ctx = this.map) {
    const opt: Required<DrawArrowOptions> = {
      tipSize: this.options.radius / 50,
      name: "",
      ...options,
    };

    this.drawLine({ ...opt }, style, ctx);

    const screenFrom = this.worldToScreen(opt.from);
    const screenTo = this.worldToScreen(opt.to);
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
      size: this.options.radius / 50,
      name: "",
      ...options,
    };

    const screenCenter = this.worldToScreen(opt.center);
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
      offset: { x: 0, y: 0 },
      ...options,
    };

    const screenOrigin = this.worldToScreen(opt.origin);

    ctx.save();
    this.applyStyle(style, ctx);

    ctx.translate(screenOrigin.x, screenOrigin.y);

    // roll back transforms to get the text to draw correctly
    ctx.rotate(-this.options.rotation);
    ctx.scale(this.options.scale.horizontal, this.options.scale.vertical);

    ctx.fillText(opt.text, opt.offset.x, opt.offset.y);
    ctx.restore();
  }

  drawCoordinateSystem(options: DrawCoordinateSystemOptions = {}, ctx = this.map) {
    const opt: Required<DrawCoordinateSystemOptions> = {
      center: { x: -this.options.radius * 0.9, y: -this.options.radius * 0.9 },
      length: this.options.radius / 10,
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

  worldToScreen(world: Coordinates): CartesianCoordinates {
    const { x, y } = this.toCartesian(world);

    return {
      x: this.scale(x),
      y: this.scale(y),
    };
  }

  screenToWorld(screen: Coordinates): CartesianCoordinates {
    const { x, y } = this.toCartesian(screen);
    const scale = this.getScale();

    return {
      x: x / scale,
      y: y / scale,
    };
  }

  canvasToScreen(canvas: CartesianCoordinates) {
    const origin = Vector.fromObject(this.getScreenOrigin());
    const screen = Vector.fromObject(canvas)
      .subtract(origin)
      .rotate(this.options.rotation)
      .multiply(new Vector(this.options.scale.horizontal, this.options.scale.vertical));

    return {
      x: screen.x,
      y: screen.y,
    };
  }

  isPolar(coordinates: any): coordinates is PolarCoordinates {
    return typeof coordinates.angle === "number" && typeof coordinates.distance === "number";
  }

  getScale() {
    return this.size / 2 / (this.options.radius + this.options.padding);
  }

  scale(distance: number) {
    return distance * this.getScale();
  }

  toRadians(angleDegrees: number) {
    return angleDegrees * (Math.PI / 180);
  }

  clear(ctx = this.map) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.restore();
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

    if (options.textBaseline) {
      ctx.textBaseline = options.textBaseline;
    }
  }

  private setupTransforms() {
    const screenOrigin = this.getScreenOrigin();

    // transform background and map
    this.bg.transform(this.options.scale.horizontal, 0, 0, this.options.scale.vertical, screenOrigin.x, screenOrigin.y);
    this.map.transform(
      this.options.scale.horizontal,
      0,
      0,
      this.options.scale.vertical,
      screenOrigin.x,
      screenOrigin.y,
    );

    // by the right hand rule, the yaw component of orientation increases as the child frame rotates counter-clockwise,
    // and for geographic poses, yaw is zero when pointing east.
    this.bg.rotate(this.options.rotation);
    this.map.rotate(this.options.rotation);
  }

  private getScreenOrigin(): CartesianCoordinates {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  private handleMouseEvent(type: MapMouseEventType, event: MouseEvent) {
    const screen = this.canvasToScreen(event);
    const world = this.screenToWorld(screen);

    switch (type) {
      case "down":
        this.mouseDownCounter++;
        break;

      case "up":
        this.mouseDownCounter--;
        break;
    }

    this.options.onMouseEvent({
      type,
      screen,
      world,
      isMouseDown: this.mouseDownCounter > 0,
      event,
    });
  }
}
