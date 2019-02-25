export interface OccupancyGridOptions {
  cellWidth: number;
  cellHeight: number;
}

export interface GenerateOccupancyGridOptions {
  rows: number;
  columns: number;
  defaultValue: number;
}

export interface SetOccupancyOptions {
  row: number;
  column: number;
  occupancy: number;
}

export interface SetOccupancyAtOptions {
  center: { x: number; y: number };
  occupancy: number;
}

export interface OccupancyGridSize {
  rows: number;
  columns: number;
  width: number;
  height: number;
}

export type OccupancyGridData = number[][];

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
    const { rows, columns, width, height } = this.getSize();
    const position = { x: center.x + width / 2, y: center.y + height / 2 };
    const row = Math.floor(position.y / this.options.cellHeight);
    const column = Math.floor(position.x / this.options.cellWidth);

    console.log("setOccupancyAt", {
      center,
      position,
      row,
      column,
    });

    if (row < 0 || row > rows - 1 || column < 0 || column > columns - 1) {
      // throw new Error(
      //   `Attempted to set occupancy at ${center.x}x${
      //     center.y
      //   } mapped to ${row}x${column} but this is outside the grid size of ${rows}x${columns}`,
      // );

      console.warn(
        `Attempted to set occupancy at ${center.x}x${
          center.y
        } mapped to ${row}x${column} but this is outside the grid size of ${rows}x${columns}`,
      );

      return;
    }

    this.setOccupancy({ row, column, occupancy });
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
}
