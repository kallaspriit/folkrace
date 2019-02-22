import chalk from "chalk";
import chokidar from "chokidar";
import fs from "fs-extra";
import debounce = require("lodash.debounce");
import path from "path";

// configure paths
const sourcePath = path.join(__dirname, "..", "build");
const destinationPath = path.join(
  __dirname,
  "..",
  "..",
  "android",
  "folkbot",
  "src",
  "main",
  "assets"
);

// configure list of files to copy from the source path
const filesToCopy = ["index.html", "static", "fonts", "icons"];

// execute the script
(async () => {
  // pass in -w or --watch to run in watch mode
  const useWatchMode =
    process.argv.find(arg => ["-w", "--watch"].indexOf(arg) !== -1) !==
    undefined;

  if (useWatchMode) {
    chokidar
      .watch(sourcePath, { ignoreInitial: true, ignorePermissionErrors: true })
      .on("all", async (event, filename: string) => {
        const relativeFilename = filename
          .replace(sourcePath, "")
          .substr(1)
          .replace(/\\/g, "/");

        process.stdout.write(
          chalk.reset(
            `> ${chalk.bold(pad(event, 9))} ${chalk.bold(
              pad(relativeFilename, 60, true)
            )}\n`
          )
        );

        await syncDebounced();
      });
  }

  const startTime = Date.now();

  await sync();

  const timeTaken = Date.now() - startTime;

  process.stdout.write(
    `${chalk.bgGreen.black(" SYNC COMPLETE ")} in ${chalk.bold(
      `${pad(timeTaken, 4)}ms`
    )}\n`
  );
})().catch(error => console.error(error));

// synchronizes the files
async function sync(): Promise<void> {
  // delete all files in destination directory
  await fs.emptyDir(destinationPath);

  // copy all requested files
  await Promise.all(
    filesToCopy.map(async filename => {
      const src = path.join(sourcePath, filename);
      const dest = path.join(destinationPath, filename);
      const srcExists = await fs.pathExists(src);

      if (!srcExists) {
        return null;
      }

      return fs.copy(src, dest);
    })
  );
}

// synchronizes the files, debounced to run at most once per second
const syncDebounced = debounce(async () => {
  const startTime = Date.now();

  await sync();

  const timeTaken = Date.now() - startTime;

  process.stdout.write(
    `${chalk.bgGreen.black(" SYNC COMPLETE ")} in ${chalk.bold(
      `${pad(timeTaken, 4, true)}ms`
    )}\n`
  );
}, 1000);

// pads a string or number
function pad(value: string | number, len: number, useRightPadding = false) {
  const str = typeof value === "string" ? value : value.toString();
  const padLength = len - str.length;

  if (padLength < 0) {
    const truncatedStr = str.substr(str.length - len - 2);

    return useRightPadding ? `..${truncatedStr}` : `${truncatedStr}..`;
  }

  const padding = new Array(padLength + 1).join(" ");

  return useRightPadding ? `${padding}${str}` : `${str}${padding}`;
}
