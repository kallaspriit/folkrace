import { pad } from "./pad";

export function formatTime(date: Date): string {
  return (
    `${pad(date.getHours(), 2, "0")}:` +
    `${pad(date.getMinutes(), 2, "0")}:` +
    `${pad(date.getSeconds(), 2, "0")}.` +
    `${pad(date.getMilliseconds(), 3, "0")}`
  );
}
