const path = require("path");

// use server ts-config for ts-node
require("ts-node").register({
  pretty: true,
  transpileOnly: true,
  project: path.join(__dirname, "tsconfig.script.json")
});
