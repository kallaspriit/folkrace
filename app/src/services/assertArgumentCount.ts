export function assertArgumentCount(args: unknown[], expectedCount: number) {
  if (args.length !== expectedCount) {
    throw new Error(`Command expected ${expectedCount} arguments but got ${args.length}`);
  }
}
