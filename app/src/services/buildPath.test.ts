import { buildPath } from "./buildPath";

it("leaves url with no arguments unchanged", () => {
  expect(buildPath("", {})).toEqual("");
  expect(buildPath("/", {})).toEqual("/");
  expect(buildPath("/foo", {})).toEqual("/foo");
  expect(buildPath("/foo/bar", {})).toEqual("/foo/bar");
});

it("replaces single required argument", () => {
  expect(buildPath("/:menu", { menu: "test" })).toEqual("/test");
  expect(buildPath("/foo/:menu", { menu: "test" })).toEqual("/foo/test");
  expect(buildPath("/foo/:menu/bar", { menu: "test" })).toEqual("/foo/test/bar");
});

it("replaces single optional argument", () => {
  expect(buildPath("/:menu?", { menu: "test" })).toEqual("/test");
  expect(buildPath("/foo/:menu?", { menu: "test" })).toEqual("/foo/test");
  expect(buildPath("/foo/:menu?/bar", { menu: "test" })).toEqual("/foo/test/bar");
});

it("replaces mixed required and optional arguments", () => {
  expect(buildPath("/:menu/:sub?", { menu: "test", sub: "page" })).toEqual("/test/page");
});

it("removes optional arguments without values if requested", () => {
  expect(buildPath("/:menu/:sub?", { menu: "test" }, true)).toEqual("/test");
  expect(buildPath("/:menu/:sub?/:another?", { menu: "test" }, true)).toEqual("/test");
});

it("preserves optional arguments without values", () => {
  expect(buildPath("/:menu/:sub?", { menu: "test" })).toEqual("/test/:sub?");
  expect(buildPath("/:menu/:sub?/:another?", { menu: "test" })).toEqual("/test/:sub?/:another?");
});

it("throws for provided arguments that do not exist in path", () => {
  expect(() => buildPath("/:menu", { thisDoesNotExist: "test" })).toThrow(
    'Url argument called "thisDoesNotExist" could not be found in path "/:menu"',
  );
});

it("throws for missing required arguments", () => {
  expect(() => buildPath("/:menu/:optional?", {})).toThrow(
    'Url argument "menu" is required in path "/:menu/:optional?"',
  );
  expect(() => buildPath("/:menu/:another/:optional?", {})).toThrow(
    'Url arguments "menu", "another" are required in path "/:menu/:another/:optional?"',
  );
});

it("accepts params as generic", () => {
  expect(
    buildPath<{ menu: string }>("/:menu", { menu: "test" }),
  ).toEqual("/test");
});
