import React from "react";
import styled from "styled-components";

import { MapRenderer } from "../lib/map-renderer";
import { containers } from "../services/containers";

export class LidarMap extends React.Component {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private mapRenderer: MapRenderer | null = null;

  componentDidMount() {
    const wrap = this.wrapRef.current;

    if (!wrap) {
      throw new Error("Wrap element was not found, this should not happen");
    }

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      range: 2000, // centimeters
      rotation: Math.PI / 2,
      render: map => {
        // get measurements
        const measurements = containers.measurements.state.measurements;

        if (measurements.length > 0) {
          // render measurements
          measurements.forEach(measurement => {
            map.drawPolarDot(measurement);
          });
        }
      },
    });

    this.mapRenderer.start();
  }

  componentWillUnmount() {
    if (this.mapRenderer !== null) {
      this.mapRenderer.destroy();
    }
  }

  render() {
    return <Map ref={this.wrapRef} />;
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
