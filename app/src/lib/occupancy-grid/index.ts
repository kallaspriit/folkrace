export interface OccupancyGridOptions {
  cellWidth: number;
  cellHeight: number;
}

export interface GenerateOccupancyGridOptions {
  rows: number;
  columns: number;
  defaultValue: number;
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
    const data: OccupancyGridData = Array(rows).fill(Array(columns).fill(defaultValue));

    return new OccupancyGrid(data, options);
  }
}
