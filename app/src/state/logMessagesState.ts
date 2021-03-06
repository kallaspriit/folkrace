import { atom } from "recoil";

export enum LogMessageType {
  RECEIVE = "RECEIVE",
  SEND = "SEND",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogMessage {
  readonly index: number;
  readonly type: LogMessageType;
  readonly message: string;
  readonly timestamp: number;
}

export const logMessagesState = atom<LogMessage[]>({
  key: "logMessagesState",
  default: [],
});
