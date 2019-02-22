import React from "react";
import styled from "styled-components";

import { MapRenderer } from "../lib/map-renderer";
import { containers } from "../services/containers";

export class LidarMap extends React.Component {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private map: MapRenderer | null = null;

  componentDidMount() {
    const wrap = this.wrapRef.current;

    if (!wrap) {
      throw new Error("Wrap element was not found, this should not happen");
    }

    // get measurements
    this.map = new MapRenderer({
      wrap,
      range: 2000, // centimeters
      rotation: Math.PI / 2,
      measurements: () => containers.measurements.state.measurements
    });

    this.map.render();
  }

  componentWillUnmount() {
    if (this.map !== null) {
      this.map.destroy();
    }
  }

  render() {
    return <CanvasWrap ref={this.wrapRef} />;
  }
}

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
