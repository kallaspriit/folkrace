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

    // const speed = Math.PI; // rad/s
    // let angle = 0;

    let mouseDownCoordinates: TimedCartesianCoordinates[] = [];
    let gridModificationMode = 0;

    const radius = 2;
    const cellSize = 0.1;
    const gridSize = (radius * 2) / cellSize;
    const occupancyGrid = OccupancyGrid.generate(
      { rows: gridSize, columns: gridSize, defaultValue: 0 },
      { cellWidth: cellSize, cellHeight: cellSize },
    );

    // get measurements
    this.mapRenderer = new MapRenderer({
      wrap,
      radius, // metres
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      render: (map, { dt, frame }) => {
        // draw background once
        if (frame === 0) {
          const step = 0.5;
          const rows = Math.ceil(map.height / map.getScale() / cellSize);
          const columns = Math.ceil(map.width / map.getScale() / cellSize);

          map.drawGrid(
            {
              rows: rows % 2 === 0 ? rows : rows + 1,
              columns: columns % 2 === 0 ? columns : columns + 1,
              cellWidth: occupancyGrid.options.cellWidth,
              cellHeight: occupancyGrid.options.cellHeight,
            },
            { strokeStyle: "#333" },
            map.bg,
          );

          for (let circleRadius = step; circleRadius <= map.options.radius; circleRadius += step) {
            map.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" }, map.bg);
            map.drawText(
              { origin: { x: 0, y: circleRadius }, text: `${circleRadius.toFixed(2)}m`, offset: { x: 10, y: 0 } },
              { fillStyle: "#444", textBaseline: "middle" },
              map.bg,
            );
          }

          map.drawCoordinateSystem(undefined, map.bg);
        }

        // clear map
        map.clear();

        // angle += speed * dt;

        // animated dot moving 180deg/s
        // map.drawMarker({ center: { angle, distance: 0.5 } }, { fillStyle: "#FFF" });

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

        // const s = Date.now();
        const path = occupancyGrid.findShortestPath({
          from: [0, 0],
          to: [occupancyGrid.data.length - 1, occupancyGrid.data[0].length - 1],
        });
        // console.log(`search took ${Date.now() - s}ms`);

        // console.log(path);

        map.drawOccupancyGrid({
          grid: occupancyGrid.data,
          path,
          cellWidth: cellSize,
          cellHeight: cellSize,
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
          case "down": {
            mouseDownCoordinates.push({ ...world, time: Date.now() });

            const currentOccupancy = occupancyGrid.getOccupancyAt(world);

            if (gridModificationMode === 0) {
              gridModificationMode = currentOccupancy === 0 ? 1 : -1;
            }

            occupancyGrid.setOccupancyAt({ center: world, occupancy: currentOccupancy === 1 ? 0 : 1 });

            break;
          }

          case "up": {
            gridModificationMode = 0;
            break;
          }

          case "move": {
            if (isMouseDown && event.button === 0) {
              if (gridModificationMode === 0) {
                const currentOccupancy = occupancyGrid.getOccupancyAt(world);

                gridModificationMode = currentOccupancy === 0 ? 1 : -1;
              }

              occupancyGrid.setOccupancyAt({ center: world, occupancy: gridModificationMode === 1 ? 1 : 0 });
            }

            break;
          }
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
