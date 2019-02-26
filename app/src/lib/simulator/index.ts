import { OccupancyGrid } from "../occupancy-grid";
import { FrameInfo, MapMouseEvent, TimedCartesianCoordinates, Visualizer } from "../visualizer";

export interface SimulatorOptions {
  container: HTMLElement;
  radius: number;
  cellSize: number;
}

export class Simulator {
  private readonly visualizer: Visualizer;
  private readonly occupancyGrid: OccupancyGrid;
  private mouseDownCoordinates: TimedCartesianCoordinates[] = [];
  private gridModificationMode = 0;

  constructor(readonly options: SimulatorOptions) {
    const gridSize = (options.radius * 2) / options.cellSize;

    // setup occupancy grid
    this.occupancyGrid = OccupancyGrid.generate(
      { rows: gridSize, columns: gridSize, defaultValue: 0 },
      { cellWidth: options.cellSize, cellHeight: options.cellSize },
    );

    // setup visualizer
    this.visualizer = new Visualizer({
      container: this.options.container,
      radius: options.radius, // metres
      scale: {
        horizontal: -1,
        vertical: 1,
      },
      rotation: -Math.PI / 2,
      padding: options.cellSize,
      render: this.render.bind(this),
      onMouseEvent: this.onMouseEvent.bind(this),
    });
  }

  start() {
    this.visualizer.start();
  }

  stop() {
    this.visualizer.stop();
  }

  private render({ map, frame }: FrameInfo) {
    // draw background once during the first frame
    if (frame === 0) {
      this.renderBackground(map);
    }

    // clear map
    map.clear();

    // const pathStartTime = Date.now();
    const path = this.occupancyGrid.findShortestPath({
      from: [0, 0],
      to: [this.occupancyGrid.data.length - 1, this.occupancyGrid.data[0].length - 1],
    });
    // const pathTimeTaken = Date.now() - pathStartTime;

    // console.log(path);

    map.drawOccupancyGrid({
      grid: this.occupancyGrid.data,
      path,
      cellWidth: this.options.cellSize,
      cellHeight: this.options.cellSize,
    });

    // draw mouse events
    const currentTime = Date.now();
    const lifetime = 250;

    // remove expired clicks
    this.mouseDownCoordinates = this.mouseDownCoordinates.filter(({ time }) => currentTime - time < lifetime);

    // draw click pulses
    this.mouseDownCoordinates.forEach(({ x, y, time }) =>
      map.drawPulse({ center: { x, y }, lifetime, age: currentTime - time }, { fillStyle: "#0F0" }),
    );
  }

  private renderBackground(map: Visualizer) {
    const gridSize = (this.options.radius * 2) / this.options.cellSize;
    const circleStep = this.options.radius / 4;

    // draw background grid
    map.drawGrid(
      {
        rows: gridSize,
        columns: gridSize,
        cellWidth: this.occupancyGrid.options.cellWidth,
        cellHeight: this.occupancyGrid.options.cellHeight,
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

  private onMouseEvent(event: MapMouseEvent) {
    switch (event.type) {
      case "down":
        this.onMouseDown(event);

        break;

      case "up":
        this.onMouseUp(event);
        break;

      case "move":
        this.onMouseMove(event);

        break;
    }
  }

  private onMouseDown({ world }: MapMouseEvent) {
    const currentOccupancy = this.occupancyGrid.getOccupancyAt(world);

    if (currentOccupancy !== undefined) {
      if (this.gridModificationMode === 0) {
        this.gridModificationMode = currentOccupancy === 0 ? 1 : -1;
      }

      this.occupancyGrid.setOccupancyAt({ center: world, occupancy: currentOccupancy === 1 ? 0 : 1 });
      this.mouseDownCoordinates.push({ ...world, time: Date.now() });
    }
  }

  private onMouseUp(_event: MapMouseEvent) {
    this.gridModificationMode = 0;
  }

  private onMouseMove({ world, isMouseDown, event }: MapMouseEvent) {
    if (isMouseDown && event.button === 0) {
      if (this.gridModificationMode === 0) {
        const currentOccupancy = this.occupancyGrid.getOccupancyAt(world);

        this.gridModificationMode = currentOccupancy === 0 ? 1 : -1;
      }

      this.occupancyGrid.setOccupancyAt({ center: world, occupancy: this.gridModificationMode === 1 ? 1 : 0 });
    }
  }
}
