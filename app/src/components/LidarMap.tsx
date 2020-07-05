import React from "react";
import styled from "styled-components";

import { LidarMeasurement } from "../containers/MeasurementsContainer";
import { FrameInfo, LayerOptions, Visualizer } from "../lib/visualizer";
import { drawRobot } from "../services/drawRobot";

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
      getTransform: (layer) => {
        const screenOrigin = {
          x: layer.width / 2,
          y: layer.height / 2,
        };
        const rotation = -Math.PI / 2;
        const scale =
          layer.size / 2 / (this.props.radius + this.props.cellSize);

        return {
          horizontalScaling: -1,
          verticalSkewing: 0,
          horizontalSkewing: 0,
          verticalScaling: 1,
          horizontalTranslation: screenOrigin.x,
          verticalTranslation: screenOrigin.y,
          rotation,
          scale,
        };
      },
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
        columns:
          2 *
          Math.ceil(layer.height / layer.getScale() / this.props.cellSize / 2),
        rows:
          2 *
          Math.ceil(layer.width / layer.getScale() / this.props.cellSize / 2),
        centered: true,
      },
      { strokeStyle: "#222" }
    );

    // draw map sized active grid
    layer.drawGrid(
      {
        rows: gridSize,
        columns: gridSize,
        cellWidth: this.props.cellSize,
        cellHeight: this.props.cellSize,
        centered: true,
      },
      { strokeStyle: "#333" }
    );

    // draw radius circles
    for (
      let circleRadius = circleStep;
      circleRadius <= this.props.radius;
      circleRadius += circleStep
    ) {
      layer.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" });
      layer.drawText(
        {
          origin: { x: 0, y: circleRadius },
          text: `${circleRadius.toFixed(2)}m`,
          offset: { x: 10, y: 0 },
        },
        { fillStyle: "#444", textBaseline: "middle" }
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
            distance: measurement.distance / 1000,
          },
        },
        {
          // draw lower quality measurements with lower opacity
          fillStyle: `rgba(255, 255, 255, ${measurement.quality / 100})`,
        }
      );
    }

    // draw robot
    // TODO: draw at predicted coordinates / angle
    drawRobot({
      center: { x: 0, y: 0 },
      angle: 0,
      layer,
    });
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
