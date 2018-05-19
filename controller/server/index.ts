import * as express from "express";
import * as path from "path";

const PORT = 80;

(async () => {
  express()
    .use(express.static(path.join(__dirname, "..", "build")))
    .listen(PORT);

  console.log(`local test server started on port ${PORT}`);
})().catch(console.error);
