export function delay(ms = 0): Promise<number> {
  return new Promise<number>((resolve) => setTimeout(resolve, ms));
}
