import { FpsCounter } from "../fps-counter";
import { GamepadManager, ManagedGamepad } from "../gamepad";
import { OccupancyGrid, Path } from "../occupancy-grid";
import { Statistics } from "../statistics";
import { CartesianCoordinates, FrameInfo, Layer, LayerMouseEvent, LayerOptions, Visualizer } from "../visualizer";

export interface TimedCartesianCoordinates extends CartesianCoordinates {
  time: number;
}

export interface SimulatorOptions {
  container: HTMLElement;
  radius: number;
  cellSize: number;
  pathPlanningIntervalMs: number;
}

export enum Stat {
  FPS = "FPS",
  PATH_FINDER = "Path finder",
}

export class Simulator {
  private readonly occupancyGrid: OccupancyGrid;
  private readonly fpsCounter: FpsCounter;
  private readonly statistics: Statistics;
  private readonly gamepadManager: GamepadManager;
  private readonly visualizer: Visualizer;
  private gamepad?: ManagedGamepad;
  private pulses: TimedCartesianCoordinates[] = [];
  private gridModificationMode = 0;
  private lastPathPlanningTime = 0;
  private path: Path = [];

  constructor(readonly options: SimulatorOptions) {
    const gridSize = (options.radius * 2) / options.cellSize;

    // setup occupancy grid
    this.occupancyGrid = OccupancyGrid.generate(
      { rows: gridSize, columns: gridSize, defaultValue: 0 },
      { cellWidth: options.cellSize, cellHeight: options.cellSize },
    );

    // setup fps counter
    this.fpsCounter = new FpsCounter();

    // setup statistics manager
    this.statistics = new Statistics();

    // setup gamepad
    this.gamepadManager = new GamepadManager({
      log: console,
      onConnect: gamepad => {
        console.log("GOT GAMEPAD", gamepad, this.gamepadManager.gamepads);

        this.gamepad = this.gamepadManager.getFirstAvailableGamepad();
      },
      onDisconnect: gamepad => {
        console.log("LOST GAMEPAD", gamepad, this.gamepadManager.gamepads);

        this.gamepad = this.gamepadManager.getFirstAvailableGamepad();
      },
      onUpdate: gamepad => {
        // console.log("GAMEPAD UPDATED", gamepad.index, gamepad.axes, gamepad.buttons);
        gamepad.axes.forEach((axisValue, axisIndex) => {
          const name = `Gamepad #${gamepad.index}.${axisIndex}`;

          if (!this.statistics.getByName(name)) {
            this.statistics.create({
              name,
              min: -1,
              max: 1,
              decimalPlaces: 2,
            });
          }

          this.statistics.report(name, axisValue);
        });
      },
    });

    // setup visualizer
    this.visualizer = new Visualizer(this.options.container);

    // common map layer options
    const mapLayerOptions: LayerOptions = {
      defaultStyle: {
        fillStyle: "#000",
        strokeStyle: "#000",
        font: "16px roboto-mono-light",
        textBaseline: "top",
      },
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
      defaultStyle: {
        fillStyle: "#000",
        strokeStyle: "#000",
        font: "16px roboto-mono-light",
        textBaseline: "top",
      },
      render: this.renderForeground.bind(this),
    });

    // create statistics
    this.statistics.create({
      name: Stat.FPS,
      min: 0,
      max: 62,
    });

    this.statistics.create({
      name: Stat.PATH_FINDER,
      unit: "ms",
      min: 0,
      max: 100,
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

    const currentTime = Date.now();

    // perform path planning at certain interval
    if (currentTime - this.lastPathPlanningTime > this.options.pathPlanningIntervalMs) {
      const pathStartTime = Date.now();
      this.path = this.occupancyGrid.findShortestPath({
        from: [0, 0],
        to: [this.occupancyGrid.data.length - 1, this.occupancyGrid.data[0].length - 1],
      });
      const pathTimeTaken = Date.now() - pathStartTime;

      this.statistics.report(Stat.PATH_FINDER, pathTimeTaken);

      this.lastPathPlanningTime = currentTime;
    }

    // console.log(path);

    // draw occupancy grid
    layer.drawOccupancyGrid({
      grid: this.occupancyGrid.data,
      path: this.path,
      cellWidth: this.options.cellSize,
      cellHeight: this.options.cellSize,
    });

    // draw pulses
    this.drawPulses(layer);

    // update the fps counter
    this.fpsCounter.update();
  }

  private renderForeground({ layer }: FrameInfo) {
    layer.clear();

    // get current fps
    const fps = this.fpsCounter.getFps();

    // report the FPS statistic
    this.statistics.report(Stat.FPS, fps);

    // draw statistic graphs
    this.statistics.statistics.forEach((statistic, i) => {
      layer.drawGraph({
        name: `${statistic.options.name}: ${statistic
          .getLatest()
          .toFixed(statistic.options.decimalPlaces || 0)}${statistic.options.unit || ""}`,
        origin: { x: 10, y: 10 + i * 90 },
        min: statistic.options.min,
        max: statistic.options.max,
        values: statistic.values,
      });
    });

    // draw gamepad buttons as a grid
    // for (const gamepad of this.gamepadManager.gamepads) {
    //   // reduce the button values to a grid
    //   const grid = [
    //     gamepad.buttons.reduce<number[]>((values, button) => {
    //       // values.push(button.value);
    //       values.push(1);

    //       return values;
    //     }, []),
    //   ];
    //   const cellSize = 100;
    //   const center = { x: 0, y: 0 };

    //   layer.drawGrid(
    //     {
    //       center,
    //       rows: 1,
    //       columns: gamepad.buttons.length,
    //       cellWidth: cellSize,
    //       cellHeight: cellSize,
    //     },
    //     { strokeStyle: "#F00" },
    //   );

    //   layer.drawOccupancyGrid({
    //     grid,
    //     center: { x: 600, y: 300 },
    //     cellWidth: cellSize,
    //     cellHeight: cellSize,
    //   });
    // }
  }

  private drawPulses(layer: Layer) {
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
