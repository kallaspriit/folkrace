export default function assertUnreachable(value: never, message: string): never {
  throw new Error(`${message} (${value})`);
}
