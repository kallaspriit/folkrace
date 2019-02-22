import React from "react";
import styled from "styled-components";

import { MapRenderer } from "../lib/map-renderer";

export class BotView extends React.Component {
  private readonly wrapRef = React.createRef<HTMLDivElement>();
  private mapRenderer: MapRenderer | null = null;

  componentDidMount() {
    const wrap = this.wrapRef.current;

    if (!wrap) {
      throw new Error("Wrap element was not found, this should not happen");
    }

    const speed = Math.PI; // rad/s
    let angle = 0;

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      range: 1000,
      render: (map, { dt, frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 500;

          for (let distance = step; distance <= map.options.range; distance += step) {
            map.drawCircle({ x: 0, y: 0 }, distance, map.bg);
          }
        }

        // clear map
        map.clear();
        map.resetMapStyles();

        angle += speed * dt;

        // animated dot moving 180deg/s
        map.drawDot({ angle, distance: 500 });

        // fixed dot using cartesian coordinates
        map.drawDot({ angle: 0, distance: 500 }, { size: 100, color: "#00F" });
        map.drawDot({ x: 1000, y: 0 }, { size: 100, color: "#F00" });
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
