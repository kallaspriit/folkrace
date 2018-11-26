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
  readonly state: LogState = {
    entries: []
  };

  private lastId = 0;

  addEntry(message: string, avoidDuplicate = true) {
    // update state (use the callback syntax not to miss any updates if called in series)
    this.setState(previousState => {
      const lastEntry =
        this.state.entries.length > 0
          ? this.state.entries[this.state.entries.length - 1]
          : null;

      // skip the message if requested not to add the same message twice in a row
      if (lastEntry !== null && avoidDuplicate) {
        const [lastCommand] = lastEntry.message.split(":");
        const [newCommand] = message.split(":");

        // check whether the new command is the same as last
        if (newCommand === lastCommand) {
          const updatedEntries: LogEntry[] = [
            // remove last entry
            ...previousState.entries.slice(0, this.state.entries.length - 1),
            // add it again with updated time
            {
              id: (this.lastId++).toString(),
              time: new Date(),
              message
            }
          ];

          return {
            entries: updatedEntries
          };
        }
      }

      // appends the log entry
      const entries: LogEntry[] = [
        ...previousState.entries,
        {
          id: (this.lastId++).toString(),
          time: new Date(),
          message
        }
      ];

      // limit the number of entries
      while (entries.length > MAX_LOG_ENTRY_COUNT) {
        entries.shift();
      }

      return {
        entries
      };
    }).catch(error => console.error(error));
  }

  clear() {
    this.setState({
      entries: []
    }).catch(error => console.error(error));
  }
}
