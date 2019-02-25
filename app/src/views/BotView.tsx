import React from "react";
import styled from "styled-components";

import { CartesianCoordinates, MapRenderer } from "../lib/map-renderer";

export class BotView extends React.Component {
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

    const speed = Math.PI; // rad/s
    let angle = 0;
    const mouseDownCoordinates: CartesianCoordinates[] = [];

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      range: 1, // metres
      render: (map, { dt, frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 0.5;

          for (let radius = step; radius <= map.options.range; radius += step) {
            map.drawCircle({ radius }, undefined, map.bg);
          }

          map.drawCoordinateSystem(undefined, map.bg);

          // map.drawGrid(
          //   {
          //     rows: 4,
          //     columns: 4,
          //     cellWidth: 100,
          //     cellHeight: 100,
          //   },
          //   map.bg,
          // );
        }

        // clear map
        map.clear();

        angle += speed * dt;

        // animated dot moving 180deg/s
        map.drawDot({ center: { angle, distance: 0.5 } }, { fillStyle: "#FFF" });

        // fixed dot using cartesian coordinates
        map.drawDot({ center: { angle: 0, distance: 0.5 }, size: 0.1 }, { fillStyle: "#00F" });
        map.drawDot(
          {
            center: { angle: map.toRadians(45), distance: 0.5 },
            size: 0.1,
          },
          { fillStyle: "#0F0" },
        );
        map.drawDot({ center: { x: 1, y: 0 }, size: 0.1 }, { fillStyle: "#F00" });

        // draw test line
        // map.drawLine({
        //   from: { x: 0, y: 0 },
        //   to: { x: -0.5, y: 0 },
        // });

        // draw mouse down events
        mouseDownCoordinates.forEach(coordinates => map.drawDot({ center: coordinates }));
      },
      onMouseDown: ({ screen, world }) => {
        console.log("DOWN", screen.x, screen.y);

        mouseDownCoordinates.push(world);
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
