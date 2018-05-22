export default function pad(data: string | number, length: number, padder = " "): string {
  const str = typeof data === "string" ? data : data.toString();

  // return as is if already long enough
  if (str.length >= length) {
    return str;
  }

  const missingLength = length - str.length;

  return `${new Array(missingLength + 1).join(padder)}${str}`;
}
