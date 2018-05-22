import { Container } from "unstated";

export interface LogEntry {
  id: string;
  time: Date;
  message: string;
}

export interface LogState {
  entries: LogEntry[];
}

export default class LogContainer extends Container<LogState> {
  public readonly state: LogState = {
    entries: [],
  };

  private lastId = 0;

  public addEntry(message: string) {
    this.setState({
      entries: [
        ...this.state.entries,
        {
          id: (this.lastId++).toString(),
          time: new Date(),
          message,
        },
      ],
    });
  }
}
