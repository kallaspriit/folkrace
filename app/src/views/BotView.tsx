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

    const speed = 360; // deg/s
    let angle = 0;

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      range: 2000,
      // step: 500,
      rotation: -Math.PI / 2,
      // measurements: () => [{ angle: 0, distance: 1000 }, { angle: 180, distance: 500 }],
      render: (map, { dt }) => {
        // console.log("render", { info });

        angle += speed * dt;

        map.clear();
        map.drawPolarDot({ angle, distance: 1000 });
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
