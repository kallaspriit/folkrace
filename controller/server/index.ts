import * as express from "express";
import * as path from "path";

const PORT = 80;

(async () => {
  express()
    .use(
      express.static(path.join(__dirname, "..", "build"), {
        fallthrough: true,
      }),
    )
    .get("*", (_request, response, _next) => {
      response.sendfile(path.join(__dirname, "..", "build", "index.html"));
    })
    .listen(PORT);

  console.log(`local test server started on port ${PORT}`);
})().catch(console.error);
