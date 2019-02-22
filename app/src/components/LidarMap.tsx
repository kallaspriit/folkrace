import React from "react";

import { containers } from "../services/containers";

import { LidarMeasurement } from "../containers/MeasurementsContainer";
import { styled } from "../theme";

const CanvasWrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BackgroundCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

const MapCanvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
`;

interface LidarMapOptions {
  backgroundCanvas: HTMLCanvasElement;
  mapCanvas: HTMLCanvasElement;
  measurements: () => LidarMeasurement[];
  range: number;
  rotation?: number;
  dotSize?: number;
}

interface CartesianCoordinates {
  x: number;
  y: number;
}

interface PolarCoordinates {
  angle: number;
  distance: number;
}

class LidarMapRenderer {
  private options: Required<LidarMapOptions>;
  private bg: CanvasRenderingContext2D;
  private map: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private size: number;
  private isRunning = false;
  private angle = 0;

  constructor(options: LidarMapOptions) {
    this.options = {
      rotation: 0,
      dotSize: 5,
      ...options
    };

    // get size
    this.width = this.options.backgroundCanvas.offsetWidth;
    this.height = this.options.backgroundCanvas.offsetHeight;

    // use minimum of width/height as size
    this.size = Math.min(this.width, this.height) - 2;

    // set canvas elements width and height
    this.options.backgroundCanvas.setAttribute(
      "width",
      `${this.width.toString()}px`
    );
    this.options.backgroundCanvas.setAttribute(
      "height",
      `${this.height.toString()}px`
    );
    this.options.mapCanvas.setAttribute("width", `${this.width.toString()}px`);
    this.options.mapCanvas.setAttribute(
      "height",
      `${this.height.toString()}px`
    );

    // get contexts
    const backgroundContext = this.options.backgroundCanvas.getContext("2d");
    const mapContext = this.options.mapCanvas.getContext("2d");

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

export class LidarMap extends React.Component {
  private readonly backgroundRef = React.createRef<HTMLCanvasElement>();
  private readonly mapRef = React.createRef<HTMLCanvasElement>();
  private map: LidarMapRenderer | null = null;

  componentDidMount() {
    const backgroundCanvas = this.backgroundRef.current;
    const mapCanvas = this.mapRef.current;

    if (!backgroundCanvas) {
      throw new Error(
        "Background canvas element was not found, this should not happen"
      );
    }

    if (!mapCanvas) {
      throw new Error(
        "Map canvas element was not found, this should not happen"
      );
    }

    // get measurements
    this.map = new LidarMapRenderer({
      backgroundCanvas,
      mapCanvas,
      measurements: () => containers.measurements.state.measurements,
      range: 2000, // centimeters
      rotation: Math.PI / 2
    });

    this.map.render();
  }

  componentWillUnmount() {
    if (this.map !== null) {
      this.map.destroy();
    }
  }

  render() {
    return (
      <CanvasWrap>
        <BackgroundCanvas ref={this.backgroundRef} />
        <MapCanvas ref={this.mapRef} />
      </CanvasWrap>
    );
  }
}
