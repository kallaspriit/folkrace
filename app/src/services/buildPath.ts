export function buildPath<Params extends { [K in keyof Params]?: string } = Record<string, string>>(
  path: string,
  params?: Params,
  removeOptional = false,
) {
  // path is something like /my/:menu/:page?
  let url = path;

  // replace provided parameters
  if (params) {
    Object.keys(params).forEach((name) => {
      const value = params[name as keyof Params];

      if (value === undefined) {
        return;
      }

      const regexp = new RegExp(`/:${name}[?]?`);

      if (!url.match(regexp)) {
        throw new Error(`Url argument called "${name}" could not be found in path "${path}"`);
      }

      url = url.replace(regexp, `/${value}`);
    });
  }

  // remove optional arguments without values if requested
  if (removeOptional) {
    url = url.replace(/\/:\w+\?/g, "");
  }

  // find missing required arguments
  const missingRequiredArgumentNames = Array.from(url.matchAll(/\/:([\w?]+)/g))
    .map((missingArgumentMatch) => missingArgumentMatch[1])
    .filter((arg) => arg.substr(-1) !== "?");

  // throw for missing required arguments
  if (missingRequiredArgumentNames.length === 1) {
    throw new Error(`Url argument "${missingRequiredArgumentNames[0]}" is required in path "${path}"`);
  } else if (missingRequiredArgumentNames.length > 1) {
    throw new Error(`Url arguments "${missingRequiredArgumentNames.join('", "')}" are required in path "${path}"`);
  }

  return url;
}
