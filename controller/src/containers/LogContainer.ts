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

  public addEntry(message: string, avoidDuplicate = true) {
    const lastEntryMessage = this.state.entries.length > 0 ? this.state.entries[this.state.entries.length - 1] : null;

    // skip the message if requested not to add the same message twice in a row
    if (lastEntryMessage !== null && message === lastEntryMessage.message && avoidDuplicate) {
      // update the last entry time
      const updatedEntries: LogEntry[] = [
        ...this.state.entries.slice(0, this.state.entries.length - 1), // remove last
        {
          ...lastEntryMessage,
          time: new Date(),
        },
      ];

      // update state
      this.setState({
        entries: updatedEntries,
      });

      return;
    }

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
