import React from "react";
import styled from "styled-components";

import { MapRenderer, TimedCartesianCoordinates } from "../lib/map-renderer";
import { OccupancyGrid } from "../lib/occupancy-grid";

export class Simulation extends React.Component {
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

    let mouseDownCoordinates: TimedCartesianCoordinates[] = [];
    let gridModificationMode = 0;

    // config
    const radius = 2;
    const cellSize = 0.1;
    const gridSize = (radius * 2) / cellSize;
    const circleStep = radius / 4;

    // generate empty map
    const occupancyGrid = OccupancyGrid.generate(
      { rows: gridSize, columns: gridSize, defaultValue: 0 },
      { cellWidth: cellSize, cellHeight: cellSize },
    );

    // setup map renderer
    this.mapRenderer = new MapRenderer({
      wrap,
      radius, // metres
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      padding: cellSize,
      render: (map, { dt, frame }) => {
        // draw background once during the first frame
        if (frame === 0) {
          // draw background grid
          map.drawGrid(
            {
              rows: gridSize,
              columns: gridSize,
              cellWidth: occupancyGrid.options.cellWidth,
              cellHeight: occupancyGrid.options.cellHeight,
            },
            { strokeStyle: "#333" },
            map.bg,
          );

          // draw radius circles
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

        // clear map
        map.clear();

        const pathStartTime = Date.now();
        const path = occupancyGrid.findShortestPath({
          from: [0, 0],
          to: [occupancyGrid.data.length - 1, occupancyGrid.data[0].length - 1],
        });
        const pathTimeTaken = Date.now() - pathStartTime;

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

        // remove expired clicks
        mouseDownCoordinates = mouseDownCoordinates.filter(({ time }) => currentTime - time < lifetime);

        // draw click pulses
        mouseDownCoordinates.forEach(({ x, y, time }) =>
          map.drawPulse({ center: { x, y }, lifetime, age: currentTime - time }, { fillStyle: "#0F0" }),
        );
      },
      onMouseEvent: ({ type, world, isMouseDown, event }) => {
        switch (type) {
          case "down": {
            const currentOccupancy = occupancyGrid.getOccupancyAt(world);

            if (currentOccupancy !== undefined) {
              if (gridModificationMode === 0) {
                gridModificationMode = currentOccupancy === 0 ? 1 : -1;
              }

              occupancyGrid.setOccupancyAt({ center: world, occupancy: currentOccupancy === 1 ? 0 : 1 });
              mouseDownCoordinates.push({ ...world, time: Date.now() });
            }

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
