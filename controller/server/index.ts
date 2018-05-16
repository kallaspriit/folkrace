import * as express from "express";
import * as path from "path";

(async () => {
  const app = express();

  app.use(express.static(path.join(__dirname, "..", "src")));
  app.use(express.static(path.join(__dirname, "..", "build/src")));
  app.use("/src", express.static(path.join(__dirname, "..", "src")));

  app.listen(80);
})().catch(console.error);
