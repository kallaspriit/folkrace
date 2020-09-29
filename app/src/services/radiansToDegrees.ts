export function radiansToDegrees(radians: number, normalizeRange = true) {
  const degrees = radians * (180 / Math.PI);

  if (!normalizeRange) {
    return degrees;
  }

  const result = degrees % 360;

  if (result < 0) {
    return result + 360;
  }

  return result;
}
