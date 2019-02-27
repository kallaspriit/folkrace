import React from "react";
import styled from "styled-components";

import { LidarMeasurement } from "../containers/MeasurementsContainer";
import { FrameInfo, LayerOptions, Visualizer } from "../lib/visualizer";

export interface LidarMapProps {
  radius: number;
  cellSize: number;
  measurements(): LidarMeasurement[];
}

export class LidarMap extends React.Component<LidarMapProps> {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private visualizer: Visualizer | null = null;

  componentDidMount() {
    // map setup is delayed to allow for it to get correct size
    setImmediate(() => this.setupMap());
  }

  componentWillUnmount() {
    // stop and destroy the visualizer
    if (this.visualizer !== null) {
      this.visualizer.stop();
      this.visualizer = null;
    }
  }

  render() {
    return <Map ref={this.wrapRef} />;
  }

  private setupMap() {
    const wrap = this.wrapRef.current;

    if (!wrap) {
      throw new Error("Wrap element was not found, this should not happen");
    }

    // setup visualizer
    this.visualizer = new Visualizer(wrap);

    // common map layer options
    const mapLayerOptions: LayerOptions = {
      radius: this.props.radius,
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      padding: this.props.cellSize,
    };

    this.visualizer.createLayer({
      ...mapLayerOptions,
      render: this.renderBackground.bind(this),
    });

    this.visualizer.createLayer({
      ...mapLayerOptions,
      render: this.renderMap.bind(this),
    });

    // start rendering
    this.visualizer.start();
  }

  private renderBackground({ layer, frame }: FrameInfo) {
    // only draw the first frame
    if (frame > 0) {
      return;
    }

    const gridSize = (this.props.radius * 2) / this.props.cellSize;
    const circleStep = this.props.radius / 4;

    // draw full size background grid
    layer.drawGrid(
      {
        cellWidth: this.props.cellSize,
        cellHeight: this.props.cellSize,
      },
      { strokeStyle: "#222" },
    );

    // draw map sized active grid
    layer.drawGrid(
      {
        rows: gridSize,
        columns: gridSize,
        cellWidth: this.props.cellSize,
        cellHeight: this.props.cellSize,
      },
      { strokeStyle: "#333" },
    );

    // draw radius circles
    for (let circleRadius = circleStep; circleRadius <= layer.options.radius; circleRadius += circleStep) {
      layer.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" });
      layer.drawText(
        { origin: { x: 0, y: circleRadius }, text: `${circleRadius.toFixed(2)}m`, offset: { x: 10, y: 0 } },
        { fillStyle: "#444", textBaseline: "middle" },
      );
    }

    // draw coordinates system
    layer.drawCoordinateSystem();
  }

  private renderMap({ layer }: FrameInfo) {
    // clear map
    layer.clear();

    // get measurements
    const measurements = this.props.measurements();

    // render measurements
    for (const measurement of measurements) {
      layer.drawMarker(
        {
          center: {
            angle: layer.toRadians(measurement.angle),
            distance: measurement.distance / 100,
          },
        },
        {
          // draw lower quality measurements with lower opacity
          fillStyle: `rgba(255, 255, 255, ${measurement.quality / 100})`,
        },
      );
    }
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
