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
      radius: 2, // meters
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      render: (map, { frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 0.5;

          for (let radius = step; radius <= map.options.radius; radius += step) {
            map.drawCircle({ radius }, undefined, map.bg);
          }
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

    this.mapRenderer.start();
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
