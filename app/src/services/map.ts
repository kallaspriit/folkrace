export function map(x: number, inMin: number, inMax: number, outMin: number, outMax: number, capped = true) {
  const uncapped = ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  if (!capped) {
    return uncapped;
  }

  const min = Math.min(outMin, outMax);
  const max = Math.max(outMin, outMax);

  return Math.min(Math.max(uncapped, min), max);
}
