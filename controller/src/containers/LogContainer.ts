import { Container } from "unstated";

interface LogEntry {
  id: string;
  time: Date;
  message: string;
}

interface LogState {
  entries: LogEntry[];
}

export class LogContainer extends Container<LogState> {
  public readonly state = {
    entries: [
      // TODO: remove test
      {
        id: "1",
        time: new Date(),
        message: "Static test",
      },
      {
        id: "2",
        time: new Date(),
        message: "Second test that has a very long log message that does not fit on a single line",
      },
    ],
  };

  private lastId = 0;

  public log(message: string) {
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
