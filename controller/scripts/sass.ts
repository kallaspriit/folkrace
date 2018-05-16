import chalk from "chalk";
import * as chokidar from "chokidar";
import * as fs from "fs";
import { debounce } from "lodash";
import * as sass from "node-sass";
import * as path from "path";

export interface ICompileError extends Error {
  formatted?: string;
  file?: string;
  line?: string;
}

// pass in -w or --watch to run in watch mode
const useWatchMode = process.argv.find(arg => ["-w", "--watch"].indexOf(arg) !== -1) !== undefined;

if (useWatchMode) {
  // const watcher = chokidar.watch(path.join(__dirname, "..", "src", "*.scss"));
  const watcher = chokidar.watch("src/*.scss");

  // debounce running the synchronization
  const runDebounce = debounce(async () => {
    const startTime = Date.now();

    try {
      await compile();
      const timeTaken = Date.now() - startTime;

      process.stdout.write(`${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);
    } catch (error) {
      const timeTaken = Date.now() - startTime;

      showError(error, timeTaken);
    }
  }, 500);

  watcher.on("all", async (event, filename) => {
    process.stdout.write(
      chalk.reset(`> ${chalk.bold(pad(event, 6))} for ${chalk.bold(pad(filename, 30))}, recompiling.. `),
    );

    runDebounce();
  });
} else {
  const startTime = Date.now();

  compile()
    .then(() => {
      const timeTaken = Date.now() - startTime;

      process.stdout.write(`${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);
    })
    .catch(error => {
      const timeTaken = Date.now() - startTime;

      showError(error, timeTaken);
    });
}

async function compile(): Promise<sass.Result> {
  return new Promise<sass.Result>((resolve, reject) => {
    const file = path.join(__dirname, "..", "src", "style.scss");
    const outFile = path.join(__dirname, "..", "build", "src", "style.css");

    sass.render(
      {
        file,
        outFile,
        sourceMapEmbed: true,
        sourceMapContents: true,
      },
      (renderError, result) => {
        if (renderError) {
          reject(renderError);

          return;
        }

        fs.writeFile(outFile, result.css, cssWriteError => {
          if (cssWriteError) {
            reject(cssWriteError);

            return;
          }

          resolve(result);
        });
      },
    );
  });
}

function pad(value: string | number, padding: number) {
  const str = typeof value === "string" ? value : value.toString();
  const padLength = padding - str.length;

  if (padLength < 1) {
    return str;
  }

  return `${new Array(padLength + 1).join(" ")}${str}`;
}

function showError(error: ICompileError, timeTaken: number) {
  const message = typeof error.formatted === "string" ? error.formatted : error.message;
  const paddedMessage = message
    .split("\n")
    .map(line => `    ${line}`)
    .join("\n");

  process.stdout.write(`${chalk.bgRed.white(" FAIL ")} in ${chalk.bold(`${pad(timeTaken, 4)}ms`)}\n`);

  if (error.file && error.line) {
    process.stdout.write(`\n${chalk.redBright(error.file)}${chalk.gray(":")} ${chalk.bold(error.line)}\n\n`);
  }

  process.stdout.write(`${paddedMessage}\n\n`);
}
