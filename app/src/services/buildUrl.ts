import { buildPath } from "./buildPath";

export function buildUrl<Params extends { [K in keyof Params]?: string } = Record<string, string>>(
  path: string,
  params?: Params,
) {
  return buildPath(path, params, true);
}
