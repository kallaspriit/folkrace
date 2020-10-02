import { Vector, VectorCoordinates } from "../lib/vector";

export function getVectorLength(vector: VectorCoordinates) {
  return Vector.fromObject(vector).length();
}
