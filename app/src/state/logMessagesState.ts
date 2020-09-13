import { atom } from "recoil";

export enum LogMessageType {
  RECEIVE = "RECEIVE",
  SEND = "SEND",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogMessage {
  type: LogMessageType;
  message: string;
  transportName?: string;
}

export const logMessagesState = atom<LogMessage[]>({
  key: "logMessagesState",
  default: [],
});
