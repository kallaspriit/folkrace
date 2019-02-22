import { Container } from "unstated";

export enum MessageType {
  INFO = "INFO",
  ERROR = "ERROR",
  RX = "RX",
  TX = "TX",
}

export interface LogEntry {
  readonly id: string;
  readonly time: Date;
  readonly message: string;
  readonly type: MessageType;
  readonly count: number;
}

export interface LogState {
  readonly entries: LogEntry[];
}

export const MAX_LOG_ENTRY_COUNT = 200;

export class LogContainer extends Container<LogState> {
  readonly state: LogState = {
    entries: [],
  };

  private lastId = 0;

  addEntry(message: string, avoidDuplicate = true) {
    // update state (use the callback syntax not to miss any updates if called in series)
    this.setState(previousState => {
      const lastEntry = this.state.entries.length > 0 ? this.state.entries[this.state.entries.length - 1] : null;
      const type = this.resolveMessageType(message);

      // skip the message if requested not to add the same message twice in a row
      if (lastEntry !== null && avoidDuplicate) {
        // check whether the latest message is the same as last
        if (message === lastEntry.message) {
          const updatedEntries: LogEntry[] = [
            // remove last entry
            ...previousState.entries.slice(0, this.state.entries.length - 1),
            // add it again with updated time
            {
              id: (this.lastId++).toString(),
              time: new Date(),
              message,
              type,
              count: lastEntry.count + 1,
            },
          ];

          return {
            entries: updatedEntries,
          };
        }
      }

      // appends the log entry
      const entries: LogEntry[] = [
        ...previousState.entries,
        {
          id: (this.lastId++).toString(),
          time: new Date(),
          message,
          type,
          count: 1,
        },
      ];

      // limit the number of entries
      while (entries.length > MAX_LOG_ENTRY_COUNT) {
        entries.shift();
      }

      return {
        entries,
      };
    }).catch(error => console.error(error));
  }

  clear() {
    this.setState({
      entries: [],
    }).catch(error => console.error(error));
  }

  private resolveMessageType(message: string): MessageType {
    const firstCharacter = message.substr(0, 1);

    switch (firstCharacter) {
      case "<":
        return MessageType.RX;

      case ">":
        return MessageType.TX;

      case "@":
        return MessageType.ERROR;

      case "#":
        return MessageType.INFO;

      default:
        return MessageType.INFO;
    }
  }
}
