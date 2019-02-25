import React from "react";
import styled from "styled-components";

import { CartesianCoordinates, MapRenderer } from "../lib/map-renderer";
import { OccupancyGrid } from "../lib/occupancy-grid";

export interface TimedCartesianCoordinates extends CartesianCoordinates {
  time: number;
}

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
    let mouseDownCoordinates: TimedCartesianCoordinates[] = [];
    // const grid = [
    //   [1.0, 0.8, 0.0, 0.5, 0.8, 1.0], //
    //   [1.0, 0.0, 0.0, 0.0, 1.0, 1.0],
    //   [1.0, 0.0, 0.1, 0.0, 1.0, 1.0],
    //   [1.0, 0.0, 0.0, 0.0, 1.0, 1.0],
    //   [1.0, 0.0, 0.6, 0.0, 0.6, 0.8],
    //   [1.0, 0.0, 0.8, 0.0, 0.4, 0.6],
    // ];

    const occupancyGrid = OccupancyGrid.generate(
      { rows: 20, columns: 20, defaultValue: 0.1 },
      { cellWidth: 0.1, cellHeight: 0.1 },
    );
    // const occupancyGrid = new OccupancyGrid(
    //   [
    //     [1.0, 0.8, 0.0, 0.5, 0.8, 1.0], //
    //     [1.0, 0.0, 0.0, 0.0, 1.0, 1.0],
    //     [1.0, 0.0, 0.1, 0.0, 1.0, 1.0],
    //     [1.0, 0.0, 0.0, 0.0, 1.0, 1.0],
    //     [1.0, 0.0, 0.6, 0.0, 0.6, 0.8],
    //     [1.0, 0.0, 0.8, 0.0, 0.4, 0.6],
    //   ],
    //   { cellWidth: 0.1, cellHeight: 0.1 },
    // );

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      radius: 1, // metres
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      render: (map, { dt, frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 0.25;

          map.drawGrid(
            {
              // TODO: calculate from size
              rows: 60,
              columns: 60,
              cellWidth: occupancyGrid.options.cellWidth,
              cellHeight: occupancyGrid.options.cellHeight,
            },
            { strokeStyle: "#333" },
            map.bg,
          );

          for (let radius = step; radius <= map.options.radius; radius += step) {
            map.drawCircle({ radius }, { strokeStyle: "#444" }, map.bg);
            map.drawText(
              { origin: { x: 0, y: radius }, text: `${radius.toFixed(2)}m`, offset: { x: 10, y: 0 } },
              { fillStyle: "#444", textBaseline: "middle" },
              map.bg,
            );
          }

          map.drawCoordinateSystem(undefined, map.bg);
        }

        // clear map
        map.clear();

        angle += speed * dt;

        // animated dot moving 180deg/s
        map.drawMarker({ center: { angle, distance: 0.5 } }, { fillStyle: "#FFF" });

        // fixed dot using cartesian coordinates
        // map.drawMarker({ center: { angle: 0, distance: 0.5 }, size: 0.1 }, { fillStyle: "#00F" });
        // map.drawMarker(
        //   {
        //     center: { angle: map.toRadians(45), distance: 0.5 },
        //     size: 0.1,
        //   },
        //   { fillStyle: "#0F0" },
        // );
        // map.drawMarker({ center: { x: 1, y: 0 }, size: 0.1 }, { fillStyle: "#F00" });
        // map.drawBox({ origin: { x: 0, y: 0 }, width: 0.1, height: 0.1 });
        // map.drawLine({
        //   from: { x: 0, y: 0 },
        //   to: { x: -0.5, y: 0 },
        // });

        map.drawOccupancyGrid({
          grid: occupancyGrid.data,
          cellWidth: 0.1,
          cellHeight: 0.1,
        });

        // draw mouse events
        const currentTime = Date.now();
        const lifetime = 250;

        // remove dead clicks
        mouseDownCoordinates = mouseDownCoordinates.filter(({ time }) => currentTime - time < lifetime);

        mouseDownCoordinates.forEach(({ x, y, time }) =>
          map.drawPulse({ center: { x, y }, lifetime, age: currentTime - time }, { fillStyle: "#0F0" }),
        );
        // mouseUpCoordinates.forEach(coordinates => map.drawMarker({ center: coordinates }, { fillStyle: "#0F0" }));
      },
      onMouseEvent: ({ type, world, isMouseDown, event }) => {
        switch (type) {
          case "down":
            mouseDownCoordinates.push({ ...world, time: Date.now() });

            occupancyGrid.setOccupancyAt({ center: world, occupancy: 1 });

            break;

          // case "up":
          //   mouseUpCoordinates.push({ ...world, time: Date.now() });
          //   break;

          case "move":
            if (isMouseDown && event.button === 0) {
              occupancyGrid.setOccupancyAt({ center: world, occupancy: 1 });
            }

            break;
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
