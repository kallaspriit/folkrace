import React from "react";
import styled from "styled-components";

import { MapRenderer } from "../lib/map-renderer";
import { containers } from "../services/containers";

export class LidarMap extends React.Component {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private mapRenderer: MapRenderer | null = null;

  componentDidMount() {
    // map setup is delayed to allow for it to get correct size
    setImmediate(() => this.setupMap());
  }

  componentWillUnmount() {
    if (this.mapRenderer !== null) {
      this.mapRenderer.destroy();
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

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      range: 2000, // millimeters
      render: (map, { frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 500;

          for (let distance = step; distance <= map.options.range; distance += step) {
            map.drawCircle({ distance }, map.bg);
          }
        }

        // get measurements
        const measurements = containers.measurements.state.measurements;

        if (measurements.length > 0) {
          // render measurements
          measurements.forEach(measurement => {
            map.drawDot({
              center: {
                angle: map.toRadians(measurement.angle),
                distance: measurement.distance * 10,
              },
            });
          });
        }
      },
    });

    this.mapRenderer.start();
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
