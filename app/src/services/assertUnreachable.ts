export function assertUnreachable(_impossible: never, message: string): never {
  throw new Error(message);
}
