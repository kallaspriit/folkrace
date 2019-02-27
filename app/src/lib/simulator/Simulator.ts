import { OccupancyGrid } from "../occupancy-grid";
import { CartesianCoordinates, FrameInfo, Layer, LayerMouseEvent, LayerOptions, Visualizer } from "../visualizer";

export interface TimedCartesianCoordinates extends CartesianCoordinates {
  time: number;
}

export interface SimulatorOptions {
  container: HTMLElement;
  radius: number;
  cellSize: number;
}

export class Simulator {
  private readonly visualizer: Visualizer;
  private readonly occupancyGrid: OccupancyGrid;
  private pulses: TimedCartesianCoordinates[] = [];
  private gridModificationMode = 0;

  constructor(readonly options: SimulatorOptions) {
    const gridSize = (options.radius * 2) / options.cellSize;

    // setup occupancy grid
    this.occupancyGrid = OccupancyGrid.generate(
      { rows: gridSize, columns: gridSize, defaultValue: 0 },
      { cellWidth: options.cellSize, cellHeight: options.cellSize },
    );

    // setup visualizer
    this.visualizer = new Visualizer(this.options.container);

    // common map layer options
    const mapLayerOptions: LayerOptions = {
      getTransform: layer => {
        const screenOrigin = {
          x: layer.width / 2,
          y: layer.height / 2,
        };
        const rotation = -Math.PI / 2;
        const scale = layer.size / 2 / (options.radius + options.cellSize);

        return {
          horizontalScaling: -1,
          verticalSkewing: 0,
          horizontalSkewing: 0,
          verticalScaling: 1,
          horizontalTranslation: screenOrigin.x,
          verticalTranslation: screenOrigin.y,
          rotation,
          scale,
        };
      },
    };

    // background
    this.visualizer.createLayer({
      ...mapLayerOptions,
      render: this.renderBackground.bind(this),
    });

    // map
    this.visualizer.createLayer({
      ...mapLayerOptions,
      render: this.renderMap.bind(this),
      onMouseDownEvent: this.onMouseDown.bind(this),
      onMouseUpEvent: this.onMouseUp.bind(this),
      onMouseMoveEvent: this.onMouseMove.bind(this),
    });

    // foreground
    this.visualizer.createLayer({
      render: this.renderForeground.bind(this),
    });
  }

  start() {
    this.visualizer.start();
  }

  stop() {
    this.visualizer.stop();
  }

  private renderBackground({ layer, frame }: FrameInfo) {
    // only draw the first frame
    if (frame > 0) {
      return;
    }

    const gridSize = (this.options.radius * 2) / this.options.cellSize;
    const circleStep = this.options.radius / 4;

    // draw full size background grid
    layer.drawGrid(
      {
        cellWidth: this.occupancyGrid.options.cellWidth,
        cellHeight: this.occupancyGrid.options.cellHeight,
      },
      { strokeStyle: "#222" },
    );

    // draw map sized active grid
    layer.drawGrid(
      {
        rows: gridSize,
        columns: gridSize,
        cellWidth: this.occupancyGrid.options.cellWidth,
        cellHeight: this.occupancyGrid.options.cellHeight,
      },
      { strokeStyle: "#333" },
    );

    // draw radius circles
    for (let circleRadius = circleStep; circleRadius <= this.options.radius; circleRadius += circleStep) {
      layer.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" });
      layer.drawText(
        { origin: { x: 0, y: circleRadius }, text: `${circleRadius.toFixed(2)}m`, offset: { x: 10, y: 0 } },
        { fillStyle: "#444", textBaseline: "middle" },
      );
    }

    // draw coordinates system
    layer.drawCoordinateSystem();
  }

  private renderMap({ layer }: FrameInfo) {
    // clear map
    layer.clear();

    // const pathStartTime = Date.now();
    const path = this.occupancyGrid.findShortestPath({
      from: [0, 0],
      to: [this.occupancyGrid.data.length - 1, this.occupancyGrid.data[0].length - 1],
    });
    // const pathTimeTaken = Date.now() - pathStartTime;

    // console.log(path);

    layer.drawOccupancyGrid({
      grid: this.occupancyGrid.data,
      path,
      cellWidth: this.options.cellSize,
      cellHeight: this.options.cellSize,
    });

    this.renderPulses(layer);
  }

  private renderForeground({ layer }: FrameInfo) {
    layer.drawLine({
      from: { x: 0, y: 0 },
      to: { x: layer.width, y: layer.height },
    });
  }

  private renderPulses(layer: Layer) {
    // draw mouse events
    const currentTime = Date.now();
    const lifetime = 250;

    // remove expired pulses
    this.pulses = this.pulses.filter(({ time }) => currentTime - time < lifetime);

    // draw pulses
    this.pulses.forEach(({ x, y, time }) =>
      layer.drawPulse({ center: { x, y }, lifetime, age: currentTime - time }, { fillStyle: "#0F0" }),
    );
  }

  private onMouseEvent(event: LayerMouseEvent) {
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

  private onMouseDown({ world }: LayerMouseEvent) {
    const currentOccupancy = this.occupancyGrid.getOccupancyAt(world);

    if (currentOccupancy !== undefined) {
      if (this.gridModificationMode === 0) {
        this.gridModificationMode = currentOccupancy === 0 ? 1 : -1;
      }

      this.occupancyGrid.setOccupancyAt({ center: world, occupancy: currentOccupancy === 1 ? 0 : 1 });
      this.pulses.push({ ...world, time: Date.now() });
    }
  }

  private onMouseUp(_event: LayerMouseEvent) {
    this.gridModificationMode = 0;
  }

  private onMouseMove({ world, isMouseDown, event }: LayerMouseEvent) {
    if (!isMouseDown || event.button !== 0) {
      return;
    }

    if (this.gridModificationMode === 0) {
      const currentOccupancy = this.occupancyGrid.getOccupancyAt(world);

      this.gridModificationMode = currentOccupancy === 0 ? 1 : -1;
    }

    this.occupancyGrid.setOccupancyAt({ center: world, occupancy: this.gridModificationMode === 1 ? 1 : 0 });
  }
}
