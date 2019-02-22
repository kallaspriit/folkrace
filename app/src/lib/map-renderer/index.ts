export interface LidarMapOptions {
  wrap: HTMLDivElement;
  range: number;
  rotation?: number;
  dotSize?: number;
  measurements: () => PolarMeasurement[]; // TODO: support cartesian measurements
  // TODO: support controlling when to update
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
  private readonly options: Required<LidarMapOptions>;
  private readonly bg: CanvasRenderingContext2D;
  private readonly map: CanvasRenderingContext2D;
  private readonly width: number;
  private readonly height: number;
  private readonly size: number;
  private isRunning = false;
  private readonly angle = 0;

  constructor(options: LidarMapOptions) {
    this.options = {
      rotation: 0,
      dotSize: 5,
      ...options
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

  render() {
    this.isRunning = true;

    this.renderBackground();

    window.requestAnimationFrame(time => this.renderMap(time));
  }

  destroy() {
    this.isRunning = false;
  }

  private renderBackground() {
    // draw outer circle
    this.bg.beginPath();
    this.bg.arc(0, 0, this.size / 2, 0, Math.PI * 2);
    this.bg.stroke();

    // draw middle circle
    this.bg.beginPath();
    this.bg.arc(0, 0, this.size / 3, 0, Math.PI * 2);
    this.bg.stroke();

    // draw inner circle
    this.bg.beginPath();
    this.bg.arc(0, 0, this.size / 6, 0, Math.PI * 2);
    this.bg.stroke();
  }

  private renderMap(time: number) {
    if (!this.isRunning) {
      return;
    }

    // clear the whole map canvas
    this.clear(this.map);

    // get measurements
    const measurements = this.options.measurements();

    if (measurements.length > 0) {
      // render measurements
      measurements.forEach(measurement => {
        this.renderPolarDot(measurement);
      });

      // render last measurement scan angle
      // const lastMeasurement = measurements[measurements.length - 1];

      // this.renderScanLine(lastMeasurement.angle);
    }

    window.requestAnimationFrame(newTime => this.renderMap(newTime));
  }

  private renderPolarDot(polarCoordinates: PolarCoordinates) {
    const cartesianCoordinates = this.polarToCartesian(polarCoordinates, true);
    const screenCoordinates = this.cartesianToScreen(cartesianCoordinates);

    // console.log({
    //   ...polarCoordinates,
    //   ...screenCoordinates
    // });

    this.map.fillRect(
      screenCoordinates.x - this.options.dotSize / 2,
      screenCoordinates.y - this.options.dotSize / 2,
      this.options.dotSize,
      this.options.dotSize
    );
  }

  // private renderScanLine(angle: number) {
  //   // calculate end point screen coordinates
  //   const endCartesianCoordinates = this.polarToCartesian(
  //     { angle, distance: this.options.range },
  //     true
  //   );
  //   const endScreenCoordinates = this.cartesianToScreen(
  //     endCartesianCoordinates
  //   );

  //   // draw the line
  //   this.map.beginPath();
  //   this.map.moveTo(0, 0);
  //   this.map.lineTo(endScreenCoordinates.x, endScreenCoordinates.y);
  //   this.map.stroke();
  // }

  private clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
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

  private polarToCartesian(
    { angle, distance }: PolarCoordinates,
    convertsDegrees: boolean
  ): CartesianCoordinates {
    const convertedAngle = convertsDegrees ? this.toRadians(angle) : angle;

    return {
      x: distance * Math.cos(convertedAngle + this.options.rotation),
      y: distance * Math.sin(convertedAngle + this.options.rotation)
    };
  }

  private cartesianToScreen({
    x,
    y
  }: CartesianCoordinates): CartesianCoordinates {
    const scale = this.getScale();

    return {
      x: x * scale,
      y: y * scale
    };
  }

  private getScale() {
    return this.size / 2 / this.options.range;
  }

  private toRadians(angleDegrees: number) {
    return angleDegrees * (Math.PI / 180);
  }
}
