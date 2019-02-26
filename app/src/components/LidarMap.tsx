import React from "react";
import styled from "styled-components";

import { Visualizer } from "../lib/visualizer";
import { containers } from "../services/containers";

export class LidarMap extends React.Component {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private visualizer: Visualizer | null = null;

  componentDidMount() {
    // map setup is delayed to allow for it to get correct size
    setImmediate(() => this.setupMap());
  }

  componentWillUnmount() {
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

    const radius = 2;

    // get measurements
    this.visualizer = new Visualizer({
      container: wrap,
      radius, // meters
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      padding: 0.1,
      render: ({ map, frame }) => {
        // draw background once
        if (frame === 0) {
          const circleStep = radius / 4;

          for (let circleRadius = circleStep; circleRadius <= map.options.radius; circleRadius += circleStep) {
            map.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" }, map.bg);
            map.drawText(
              { origin: { x: 0, y: circleRadius }, text: `${circleRadius.toFixed(2)}m`, offset: { x: 10, y: 0 } },
              { fillStyle: "#444", textBaseline: "middle" },
              map.bg,
            );
          }

          // draw coordinates system
          map.drawCoordinateSystem(undefined, map.bg);
        }

        // get measurements
        const measurements = containers.measurements.state.measurements;

        if (measurements.length > 0) {
          // render measurements
          measurements.forEach(measurement => {
            map.drawMarker({
              center: {
                angle: map.toRadians(measurement.angle),
                distance: measurement.distance / 10,
              },
            });
          });
        }
      },
    });

    this.visualizer.start();
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
