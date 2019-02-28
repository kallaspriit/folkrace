export interface StatisticOptions {
  readonly name: string;
  readonly min?: number;
  readonly max?: number;
  readonly unit?: string;
  readonly historyLength?: number;
}

export class Statistic {
  readonly values: number[] = [];

  constructor(readonly options: StatisticOptions) {}

  report(value: number) {
    const historyLength = this.options.historyLength || 200;

    this.values.push(value);

    if (this.values.length > historyLength) {
      this.values.shift();
    }
  }

  getLatest() {
    if (this.values.length === 0) {
      return 0;
    }

    return this.values[this.values.length - 1];
  }
}
