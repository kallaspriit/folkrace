import { Statistic, StatisticOptions } from "./Statistic";

export class Statistics {
  readonly statistics: Statistic[] = [];

  create(options: StatisticOptions) {
    const statistic = new Statistic(options);

    this.statistics.push(statistic);
  }

  getByName(name: string) {
    return this.statistics.find((statistic) => statistic.options.name === name);
  }

  report(name: string, value: number) {
    const statistic = this.getByName(name);

    if (!statistic) {
      throw new Error(`Statistic called "${name}" could not be found`);
    }

    statistic.report(value);

    return statistic;
  }
}
