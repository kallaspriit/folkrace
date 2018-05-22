import pad from "./pad";

// tslint:disable:no-magic-numbers
export default function formatTime(date: Date): string {
  return (
    `${pad(date.getHours(), 2, "0")}:` +
    `${pad(date.getMinutes(), 2, "0")}:` +
    `${pad(date.getSeconds(), 2, "0")}.` +
    `${pad(date.getMilliseconds(), 4, "0")}`
  );
}
