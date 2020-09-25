import { AStarFinder as PathFinder, DiagonalMovement, Grid, Heuristic } from "pathfinding";

export interface OccupancyGridOptions {
  cellWidth: number;
  cellHeight: number;
}

export interface GenerateOccupancyGridOptions {
  rows: number;
  columns: number;
  defaultValue: number;
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface SetOccupancyOptions {
  row: number;
  column: number;
  occupancy: number;
}

export interface SetOccupancyAtOptions {
  center: Coordinates;
  occupancy: number;
}

export interface FindShortestPathOptions {
  from: Cell;
  to: Cell;
}

export interface OccupancyGridSize {
  rows: number;
  columns: number;
  width: number;
  height: number;
}

export type OccupancyGridData = number[][];

export type Cell = [number, number];

export type Path = Cell[];

export class OccupancyGrid {
  options: Required<OccupancyGridOptions>;

  constructor(public data: OccupancyGridData, options: OccupancyGridOptions) {
    this.options = {
      ...options,
    };
  }

  static generate({ rows, columns, defaultValue }: GenerateOccupancyGridOptions, options: OccupancyGridOptions) {
    const data: OccupancyGridData = [];
    // const data: OccupancyGridData = Array(rows).fill(Array(columns).fill(defaultValue));

    for (let row = 0; row < rows; row++) {
      data[row] = Array(columns).fill(defaultValue);
    }

    return new OccupancyGrid(data, options);
  }

  setOccupancy({ row, column, occupancy }: SetOccupancyOptions) {
    this.data[row][column] = occupancy;
  }

  setOccupancyAt({ center, occupancy }: SetOccupancyAtOptions) {
    const { row, column, exists } = this.getCellAtCoordinates(center);

    if (!exists) {
      return;
    }

    this.setOccupancy({ row, column, occupancy });
  }

  getOccupancyAt(center: Coordinates) {
    const { row, column, exists } = this.getCellAtCoordinates(center);

    if (!exists) {
      return undefined;
    }

    return this.getOccupancy(row, column);
  }

  getOccupancy(row: number, column: number) {
    if (this.data[row] === undefined || this.data[row][column] === undefined) {
      return undefined;
    }

    return this.data[row][column];
  }

  getCellAtCoordinates(center: Coordinates) {
    const { rows, columns, width, height } = this.getSize();
    const position = { x: center.x + width / 2, y: center.y + height / 2 };
    const row = Math.floor(position.y / this.options.cellHeight);
    const column = Math.floor(position.x / this.options.cellWidth);
    const exists = row >= 0 && row < rows && column >= 0 && column < columns;

    return {
      row,
      column,
      exists,
    };
  }

  getSize(): OccupancyGridSize {
    const rows = this.data.length;
    const columns = this.data.length > 0 ? this.data[0].length : 0;

    return {
      rows,
      columns,
      width: rows * this.options.cellWidth,
      height: columns * this.options.cellHeight,
    };
  }

  findShortestPath({ from, to }: FindShortestPathOptions): Path {
    const grid = new Grid(this.data);
    const finder = new PathFinder({
      diagonalMovement: DiagonalMovement.Never,
      heuristic: Heuristic.euclidean,
    });
    const path = finder.findPath(from[0], from[1], to[0], to[1], grid);

    return path as Cell[];
  }
}
