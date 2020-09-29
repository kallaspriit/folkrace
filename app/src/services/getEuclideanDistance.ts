export interface Point2D {
  x: number;
  y: number;
}

export function getEuclideanDistance(a: Point2D, b: Point2D) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}
