import { Container } from "unstated";

export interface LogEntry {
  id: string;
  time: Date;
  message: string;
}

export interface LogState {
  entries: LogEntry[];
}

export const MAX_LOG_ENTRY_COUNT = 200;

export default class LogContainer extends Container<LogState> {
  public readonly state: LogState = {
    entries: [],
  };

  private lastId = 0;

  public addEntry(message: string) {
    // appends the log entry
    const entries: LogEntry[] = [
      ...this.state.entries,
      {
        id: (this.lastId++).toString(),
        time: new Date(),
        message,
      },
    ];

    // limit the number of entries
    while (entries.length > MAX_LOG_ENTRY_COUNT) {
      entries.shift();
    }

    // update state
    this.setState({
      entries,
    });
  }
}
