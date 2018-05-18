import chalk from "chalk";
import * as chokidar from "chokidar";
import * as fs from "fs-extra";
import { debounce } from "lodash";
import * as path from "path";

// files to sync
const fileMap: { [x: string]: string } = {
  "src/index.html": "../app/folkbot/src/main/res/raw/index.html",
  "build/src/main.js": "../app/folkbot/src/main/res/raw/main.js",
  "build/src/style.css": "../app/folkbot/src/main/res/raw/style.css",
};

// pass in -w or --watch to run in watch mode
const useWatchMode = process.argv.find(arg => ["-w", "--watch"].indexOf(arg) !== -1) !== undefined;

if (useWatchMode) {
  const watcher = chokidar.watch(["src/*.html", "build/src/*.js"]);

  // debounce running the synchronization
  const runDebounce = debounce(async () => {
    const startTime = Date.now();

    try {
      await sync();
      const timeTaken = Date.now() - startTime;

      process.stdout.write(`${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);
    } catch (error) {
      const timeTaken = Date.now() - startTime;

      showError(error, timeTaken);
    }
  }, 500);

  watcher.on("all", async (event, filename) => {
    process.stdout.write(
      chalk.reset(`> ${chalk.bold(pad(event, 6))} for ${chalk.bold(pad(filename, 30))}, scheduling sync\n`),
    );

    runDebounce();
  });
} else {
  const startTime = Date.now();

  sync()
    .then(() => {
      const timeTaken = Date.now() - startTime;

      process.stdout.write(`${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);
    })
    .catch(error => {
      const timeTaken = Date.now() - startTime;

      showError(error, timeTaken);
    });
}

async function sync(): Promise<void> {
  const sources = Object.keys(fileMap);
  const basePath = path.join(__dirname, "..", "..", "controller");

  for (const source of sources) {
    const destination = fileMap[source];

    try {
      await fs.copy(path.join(basePath, source), path.join(basePath, destination));
    } catch (error) {
      process.stdout.write(`failed - ${error.message}\n`);
    }
  }

  // await fs.copy(
  //   path.join(__dirname, "..", "src", "index.html"),
  //   path.join(__dirname, "..", "..", "app", "folkbot", "src", "main", "res", "raw", "index.html"),
  // );
}

function pad(value: string | number, padding: number) {
  const str = typeof value === "string" ? value : value.toString();
  const padLength = padding - str.length;

  if (padLength < 1) {
    return str;
  }

  return `${new Array(padLength + 1).join(" ")}${str}`;
}

function showError(error: Error, timeTaken: number) {
  const paddedMessage = error.message
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");

  process.stdout.write(`${chalk.bgRed.white(" FAIL ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);
  process.stdout.write(`${paddedMessage}\n\n`);
}
