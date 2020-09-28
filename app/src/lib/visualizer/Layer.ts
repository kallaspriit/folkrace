import color from "color";
import Vector from "victor";

import { map } from "../../services/map";
import { Ticker, TickInfo } from "../ticker";

export interface LayerOptions {
  readonly defaultStyle?: DrawStyle;
  getTransform?(layer: Layer): Transform;
  render?(info: FrameInfo): void;
  onMouseDownEvent?(event: LayerMouseDownEvent): void;
  onMouseUpEvent?(event: LayerMouseUpEvent): void;
  onMouseMoveEvent?(event: LayerMouseMoveEvent): void;
}

export interface Transform {
  horizontalScaling?: number;
  verticalSkewing?: number;
  horizontalSkewing?: number;
  verticalScaling?: number;
  horizontalTranslation?: number;
  verticalTranslation?: number;
  rotation?: number;
  scale?: number;
}

export interface FrameInfo {
  time: number;
  dt: number;
  frame: number;
  layer: Layer;
}

export type LayerMouseEventType = "down" | "up" | "move";

export interface LayerMouseEvent {
  type: LayerMouseEventType;
  screen: CartesianCoordinates;
  world: CartesianCoordinates;
  isMouseDown: boolean;
  event: MouseEvent;
}

export interface LayerMouseDownEvent extends LayerMouseEvent {
  type: "down";
}

export interface LayerMouseUpEvent extends LayerMouseEvent {
  type: "up";
}

export interface LayerMouseMoveEvent extends LayerMouseEvent {
  type: "move";
}

export interface CartesianCoordinates {
  x: number;
  y: number;
}

export type Size = CartesianCoordinates;

export interface PolarCoordinates {
  angle: number; // radians
  distance: number;
}

export type Coordinates = CartesianCoordinates | PolarCoordinates;

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
  centered?: boolean;
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
  rows?: number;
  columns?: number;
  origin?: Coordinates;
  centered?: boolean;
}

export interface DrawOccupancyGridOptions {
  cellWidth: number;
  cellHeight: number;
  grid: OccupancyGrid;
  path?: Path;
  origin?: Coordinates;
  centered?: boolean;
}

export interface DrawCoordinateSystemOptions {
  center?: Coordinates;
  gridSize?: number;
  length?: number;
}

export interface DrawObjectOptions {
  center: Coordinates;
  size: Size;
  angle: number;
  draw?(ctx: CanvasRenderingContext2D, options: Required<DrawObjectOptions> & { layer: Layer }): void;
}

export interface DrawGraphOptions {
  origin: Coordinates;
  name: string;
  values: number[];
  min?: number;
  max?: number;
  width?: number;
  height?: number;
}

export type OccupancyGrid = number[][];

export type Cell = [number, number];

export type Path = Cell[];

export class Layer {
  readonly options: Required<LayerOptions>;
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly size: number;
  readonly transform: Required<Transform>;
  private ticker: Ticker;
  private mouseDownCounter = 0;

  constructor(readonly canvas: HTMLCanvasElement, options: LayerOptions) {
    this.options = {
      defaultStyle: {
        fillStyle: "#000",
        strokeStyle: "#000",
        font: "16px monospace",
        textBaseline: "top",
      },
      getTransform: (_layer: Layer) => ({}),
      render: (_info: FrameInfo) => {
        /* do nothing */
      },
      onMouseDownEvent: (_event: LayerMouseDownEvent) => {
        /* do nothing */
      },
      onMouseUpEvent: (_event: LayerMouseUpEvent) => {
        /* do nothing */
      },
      onMouseMoveEvent: (_event: LayerMouseMoveEvent) => {
        /* do nothing */
      },
      ...options,
    };

    // get canvas drawing context
    const ctx = this.canvas.getContext("2d");

    // this should generally not fail
    if (!ctx) {
      throw new Error("Getting layer 2D context failed, this should not happen");
    }

    // store context
    this.ctx = ctx;

    // get dimensions
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    // use minimum of width/height as size
    this.size = Math.min(this.width, this.height) - 2;

    // mouse events should pass through if no listeners were set
    const passThroughMouseEvents =
      options.onMouseDownEvent === undefined &&
      options.onMouseUpEvent === undefined &&
      options.onMouseMoveEvent === undefined;

    // disable canvas pointer events (pass them through) if no event listeners are present
    if (passThroughMouseEvents) {
      this.canvas.style.pointerEvents = "none";
    }

    // resolve transform to use
    this.transform = {
      horizontalScaling: 1,
      verticalSkewing: 0,
      horizontalSkewing: 0,
      verticalScaling: 1,
      horizontalTranslation: 0,
      verticalTranslation: 0,
      rotation: 0,
      scale: 1,
      ...this.options.getTransform(this),
    };

    // apply transformation and rotation
    this.ctx.transform(
      this.transform.horizontalScaling,
      this.transform.verticalSkewing,
      this.transform.horizontalSkewing,
      this.transform.verticalScaling,
      this.transform.horizontalTranslation,
      this.transform.verticalTranslation,
    );
    this.ctx.rotate(this.transform.rotation);

    // set default styles
    this.applyStyle(this.options.defaultStyle);

    // only add mouse events if listener is registered
    if (options.onMouseDownEvent) {
      this.canvas.onmousedown = (event) => this.handleMouseEvent("down", event);
    }

    if (options.onMouseUpEvent) {
      this.canvas.onmouseup = (event) => this.handleMouseEvent("up", event);
    }

    if (options.onMouseMoveEvent) {
      this.canvas.onmousemove = (event) => this.handleMouseEvent("move", event);
    }

    // setup ticker
    this.ticker = new Ticker({
      tick: this.tick.bind(this),
    });
  }

  start() {
    this.ticker.start();
  }

  stop() {
    this.ticker.stop();
  }

  drawCircle(options: DrawCircleOptions, style: DrawStyle = { strokeStyle: "#000" }) {
    const opt: Required<DrawCircleOptions> = {
      center: { x: 0, y: 0 },
      ...options,
    };
    const screenCenter = this.worldToScreen(opt.center);

    this.ctx.save();
    this.applyStyle(style);

    this.ctx.beginPath();
    this.ctx.arc(screenCenter.x, screenCenter.y, this.scale(opt.radius), 0, Math.PI * 2);

    if (style.fillStyle) {
      this.ctx.fill();
    }

    if (style.strokeStyle || (!style.strokeStyle && !style.fillStyle)) {
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawPulse(options: DrawPulseOptions, style: DrawStyle = { strokeStyle: "#000" }) {
    const opt: Required<DrawPulseOptions> = {
      center: { x: 0, y: 0 },
      lifetime: 300,
      age: 0,
      size: this.size / 50 / this.getScale(),
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

  drawMarker(options: DrawMarkerOptions, style: DrawStyle = {}) {
    const opt: Required<DrawMarkerOptions> = {
      size: this.size / 100 / this.getScale(),
      ...options,
    };
    const angle = this.isPolar(opt.center) ? opt.center.angle : 0;
    const screenCenter = this.worldToScreen(opt.center);
    const screenSize = this.scale(opt.size);

    this.ctx.save();
    this.applyStyle(style);

    this.ctx.translate(screenCenter.x, screenCenter.y);
    this.ctx.rotate(angle);
    this.ctx.fillRect(-screenSize / 2, -screenSize / 2, screenSize, screenSize);

    this.ctx.restore();
  }

  drawBox(options: DrawBoxOptions, style: DrawStyle = {}) {
    const opt: Required<DrawBoxOptions> = {
      padding: 0,
      centered: false,
      ...options,
    };

    const origin = this.worldToScreen(opt.origin);
    const width = this.scale(opt.width);
    const height = this.scale(opt.height);

    const offset = opt.centered ? { x: -width / 2, y: -height / 2 } : { x: 0, y: 0 };

    this.ctx.save();
    this.applyStyle(style);

    if (style.fillStyle) {
      this.ctx.fillRect(
        origin.x + offset.x + opt.padding,
        origin.y + offset.y + opt.padding,
        width - opt.padding * 2,
        height - opt.padding * 2,
      );
    }

    if (style.strokeStyle || (!style.strokeStyle && !style.fillStyle)) {
      this.ctx.strokeRect(
        origin.x + offset.x + opt.padding,
        origin.y + offset.y + opt.padding,
        width - opt.padding * 2,
        height - opt.padding * 2,
      );
    }

    this.ctx.restore();
  }

  drawLine(options: DrawLineOptions, style: DrawStyle = {}) {
    const opt: Required<DrawLineOptions> = {
      ...options,
    };
    const screenFrom = this.worldToScreen(opt.from);
    const screenTo = this.worldToScreen(opt.to);

    this.ctx.save();
    this.applyStyle(style);

    this.ctx.beginPath();
    this.ctx.moveTo(screenFrom.x, screenFrom.y);
    this.ctx.lineTo(screenTo.x, screenTo.y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawGrid(options: DrawGridOptions, style: DrawStyle = {}) {
    const defaultRowCount = Math.ceil(this.height / this.getScale() / options.cellHeight);
    const defaultColumnCount = Math.ceil(this.width / this.getScale() / options.cellWidth);

    const opt: Required<DrawGridOptions> = {
      origin: { x: 0, y: 0 },
      centered: false,
      rows: defaultRowCount % 2 === 0 ? defaultRowCount : defaultRowCount + 1,
      columns: defaultColumnCount % 2 === 0 ? defaultColumnCount : defaultColumnCount + 1,
      ...options,
    };

    const height = opt.cellHeight * opt.rows;
    const width = opt.cellWidth * opt.columns;

    const origin = this.toCartesian(opt.origin);
    const offset: CartesianCoordinates = opt.centered ? { x: -width / 2, y: -height / 2 } : { x: 0, y: 0 };

    for (let row = 0; row <= opt.rows; row++) {
      const rowY = row * opt.cellHeight;

      this.drawLine(
        {
          from: {
            x: origin.x + offset.x,
            y: origin.y + offset.y + rowY,
          },
          to: {
            x: origin.x + offset.x + width,
            y: origin.y + offset.y + rowY,
          },
        },
        style,
      );
    }

    for (let column = 0; column <= opt.columns; column++) {
      const columnX = column * opt.cellWidth;

      this.drawLine(
        {
          from: {
            x: origin.x + offset.x + columnX,
            y: origin.y + offset.y,
          },
          to: {
            x: origin.x + offset.x + columnX,
            y: origin.y + offset.y + height,
          },
        },
        style,
      );
    }
  }

  drawOccupancyGrid(options: DrawOccupancyGridOptions, _style: DrawStyle = {}) {
    const opt: Required<DrawOccupancyGridOptions> = {
      origin: { x: 0, y: 0 },
      centered: false,
      path: [],
      ...options,
    };

    // don't attempt to draw an empty map
    if (opt.grid.length === 0) {
      return;
    }

    const rows = opt.grid.length;
    const columns = opt.grid[0].length;

    const width = opt.cellWidth * columns;
    const height = opt.cellHeight * rows;

    const origin = this.toCartesian(opt.origin);
    const offset: CartesianCoordinates = opt.centered ? { x: -width / 2, y: -height / 2 } : { x: 0, y: 0 };

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

        const delta = {
          x: column * opt.cellWidth,
          y: row * opt.cellHeight,
        };

        const position = {
          x: origin.x + offset.x + delta.x,
          y: origin.y + offset.y + delta.y,
        };

        this.drawBox(
          {
            origin: position,
            width: opt.cellWidth,
            height: opt.cellHeight,
            padding: 1,
          },
          { fillStyle: `rgba(0, 0, 0, ${occupancy})` },
        );
      }
    }

    // draw path
    for (const [column, row] of opt.path) {
      const delta = {
        x: column * opt.cellWidth,
        y: row * opt.cellHeight,
      };

      const position = {
        x: origin.x + offset.x + delta.x,
        y: origin.y + offset.x + delta.y,
      };

      this.drawBox(
        {
          origin: position,
          width: opt.cellWidth,
          height: opt.cellHeight,
          padding: 1,
        },
        { fillStyle: "rgba(0, 255, 0, 0.2)" },
      );
    }
  }

  drawArrow(options: DrawArrowOptions, style: DrawStyle = {}) {
    const opt: Required<DrawArrowOptions> = {
      tipSize: this.size / 100 / this.getScale(),
      name: "",
      ...options,
    };

    this.drawLine({ ...opt }, style);

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
    );
  }

  drawDirection(options: DrawDirectionOptions, style: DrawStyle = {}) {
    const opt: Required<DrawDirectionOptions> = {
      size: this.size / 100 / this.getScale(),
      name: "",
      ...options,
    };

    const screenCenter = this.worldToScreen(opt.center);
    const screenSize = this.scale(opt.size);

    this.ctx.save();
    this.applyStyle(style);

    this.ctx.translate(screenCenter.x, screenCenter.y);
    this.ctx.rotate(opt.angle);
    this.ctx.beginPath();
    this.ctx.moveTo(-screenSize / 2, screenSize / 2);
    this.ctx.lineTo(-screenSize / 2, -screenSize / 2);
    this.ctx.lineTo(0, 0);
    this.ctx.lineTo(-screenSize / 2, screenSize / 2);
    this.ctx.fill();

    this.ctx.restore();

    if (opt.name.length > 0) {
      const origin = this.toCartesian(opt.center);
      origin.x += opt.size * 2;

      this.drawText({ origin, text: opt.name }, style);
    }
  }

  drawText(options: DrawTextOptions, style: DrawStyle = {}) {
    const opt: Required<DrawTextOptions> = {
      offset: { x: 0, y: 0 },
      ...options,
    };

    const screenOrigin = this.worldToScreen(opt.origin);

    this.ctx.save();
    this.applyStyle(style);

    this.ctx.translate(screenOrigin.x, screenOrigin.y);

    // roll back transforms to get the text to draw correctly
    this.ctx.rotate(-this.transform.rotation);
    this.ctx.scale(this.transform.horizontalScaling, this.transform.verticalScaling);

    this.ctx.fillText(opt.text, opt.offset.x, opt.offset.y);
    this.ctx.restore();
  }

  drawCoordinateSystem(options: DrawCoordinateSystemOptions = {}) {
    const worldSize = this.screenToWorld({ x: this.width, y: this.height });
    const gridSize = options.gridSize !== undefined ? options.gridSize : this.size / 50 / this.getScale();
    const length = gridSize * 2;
    const opt: Required<DrawCoordinateSystemOptions> = {
      center: {
        x: -Math.ceil(worldSize.y / 2 / gridSize) * gridSize + length,
        y: -Math.ceil(worldSize.x / 2 / gridSize) * gridSize + length,
      },
      gridSize,
      length,
      ...options,
    };
    const center = Vector.fromObject(this.toCartesian(opt.center));

    const toX = center.clone().add(new Vector(opt.length, 0));
    const toY = center.clone().add(new Vector(0, opt.length));

    this.drawArrow({ from: opt.center, to: toX, name: "X" }, { lineWidth: 2, color: "#F00", textAlign: "center" });
    this.drawArrow({ from: opt.center, to: toY, name: "Y" }, { lineWidth: 2, color: "#0F0", textAlign: "center" });
  }

  drawGraph(options: DrawGraphOptions) {
    const opt = {
      width: 200,
      height: 80,
      ...options,
    };

    const screenOrigin = this.worldToScreen(opt.origin);
    const startIndex = Math.max(opt.values.length - opt.width, 0);
    const samples = opt.values.slice(startIndex, opt.values.length);
    const min = options.min !== undefined ? options.min : Math.min(...samples);
    const max = options.max !== undefined ? options.max : Math.max(...samples);
    const range = max - min;

    this.ctx.save();
    this.ctx.translate(screenOrigin.x, screenOrigin.y);

    // draw background
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, opt.width, opt.height);

    let xPos = opt.width;

    // draw line
    this.ctx.beginPath();

    let wasAnyValueCapped = false;

    // build the line path
    for (let i = samples.length; i >= 0; i--) {
      const value = samples[i];
      const cappedValue = Math.min(Math.max(value, min), max);
      const isCapped = Math.abs(cappedValue - value) > 0.1;
      const yPos = opt.height - Math.round(((cappedValue - min) / range) * opt.height);

      if (i === 0) {
        this.ctx.moveTo(xPos, yPos);
      } else {
        this.ctx.lineTo(xPos, yPos);
      }

      xPos--;

      if (isCapped) {
        wasAnyValueCapped = true;
      }
    }

    // draw red when any of the values were capped to min/max
    this.ctx.strokeStyle = wasAnyValueCapped ? "rgba(200, 0, 0, 0.75)" : "rgba(0, 200, 0, 0.75)";

    // draw graph line and restore
    this.ctx.stroke();
    this.ctx.restore();

    // draw name on top of the graph
    this.drawText(
      {
        origin: options.origin,
        text: options.name,
        offset: {
          x: 10,
          y: 10,
        },
      },
      {
        fillStyle: "#FFF",
      },
    );
  }

  drawObject(options: DrawObjectOptions) {
    const opt: Required<DrawObjectOptions> = {
      ...options,
      size: {
        x: this.size / 50 / this.getScale(),
        y: this.size / 50 / this.getScale(),
      },
      draw: (ctx, { size }) => {
        const screenSize = this.worldToScreen(size);

        // draw body
        ctx.fillStyle = "#900";
        ctx.fillRect(-screenSize.x / 2, -screenSize.y / 2, screenSize.x, screenSize.y);

        // draw direction arrow
        const arrowScale = 0.5;
        const arrowSize = Math.min(screenSize.x, screenSize.y) * arrowScale;

        ctx.fillStyle = "#FFF";
        ctx.beginPath();
        ctx.moveTo(-arrowSize / 2, -arrowSize / 2);
        ctx.lineTo(0, arrowSize / 2);
        ctx.lineTo(arrowSize / 2, -arrowSize / 2);
        ctx.lineTo(-arrowSize / 2, -arrowSize / 2);
        ctx.fill();
      },
    };
    const screenCenter = this.worldToScreen(opt.center);

    this.ctx.save();

    this.ctx.translate(screenCenter.x, screenCenter.y);
    this.ctx.rotate(opt.angle);

    opt.draw(this.ctx, { ...opt, layer: this });

    this.ctx.restore();
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
      .rotate(this.transform.rotation)
      .multiply(new Vector(this.transform.horizontalScaling, this.transform.verticalScaling));

    return {
      x: screen.x,
      y: screen.y,
    };
  }

  isPolar(coordinates: any): coordinates is PolarCoordinates {
    return typeof coordinates.angle === "number" && typeof coordinates.distance === "number";
  }

  getScale() {
    return this.transform.scale;
  }

  scale(distance: number) {
    return distance * this.getScale();
  }

  toRadians(angleDegrees: number) {
    return angleDegrees * (Math.PI / 180);
  }

  clear() {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  private applyStyle(options: DrawStyle) {
    if (options.color) {
      this.ctx.strokeStyle = options.color;
      this.ctx.fillStyle = options.color;
    }

    if (options.strokeStyle) {
      this.ctx.strokeStyle = options.strokeStyle;
    }

    if (options.fillStyle) {
      this.ctx.fillStyle = options.fillStyle;
    }

    if (options.lineWidth) {
      this.ctx.lineWidth = options.lineWidth;
    }

    if (options.font) {
      this.ctx.font = options.font;
    }

    if (options.textAlign) {
      this.ctx.textAlign = options.textAlign;
    }

    if (options.textBaseline) {
      this.ctx.textBaseline = options.textBaseline;
    }
  }

  // TODO: remove / refactor
  private getScreenOrigin(): CartesianCoordinates {
    return {
      x: this.width / 2,
      y: this.height / 2,
    };
  }

  private tick(info: TickInfo) {
    this.options.render({
      ...info,
      layer: this,
    });
  }

  private handleMouseEvent(type: LayerMouseEventType, event: MouseEvent) {
    const screen = this.canvasToScreen(event);
    const world = this.screenToWorld(screen);

    const info = {
      screen,
      world,
      isMouseDown: this.mouseDownCounter > 0,
      event,
    };

    switch (type) {
      case "down":
        this.mouseDownCounter++;

        this.options.onMouseDownEvent({ type, ...info });
        break;

      case "up":
        this.mouseDownCounter--;

        this.options.onMouseUpEvent({ type, ...info });
        break;

      case "move":
        this.options.onMouseMoveEvent({ type, ...info });
        break;
    }
  }
}
