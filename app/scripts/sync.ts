import chalk from "chalk";
// import * as chokidar from "chokidar";
import * as fs from "fs-extra";
// import { debounce } from "lodash";
import * as path from "path";

// configure paths and file patterns
const sourcePath = path.join(__dirname, "..", "build");
const destinationPath = path.join(
  __dirname,
  "..",
  "..",
  "android",
  "folkbot",
  "src",
  "main",
  "res",
  "raw"
);
const filesToCopy = ["index.html", "static"];

(async () => {
  const startTime = Date.now();

  await sync();

  const timeTaken = Date.now() - startTime;

  process.stdout.write(
    `${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(`${timeTaken}ms`)}\n`
  );
})().catch(error => console.error(error));

// pass in -w or --watch to run in watch mode
// const useWatchMode =
//   process.argv.find(arg => ["-w", "--watch"].indexOf(arg) !== -1) !== undefined;

// if (useWatchMode) {
//   const watcher = chokidar.watch(["build/*.js", "build/*.css", "build/*.html"]);

//   // debounce running the synchronization
//   const runDebounce = debounce(async () => {
//     const startTime = Date.now();

//     try {
//       await sync();
//       const timeTaken = Date.now() - startTime;

//       process.stdout.write(
//         `${chalk.bgGreen.black(" DONE ")} in ${chalk.bold(
//           `${pad(timeTaken, 4)}ms`
//         )}\n`
//       );
//     } catch (error) {
//       const timeTaken = Date.now() - startTime;

//       showError(error, timeTaken);
//     }
//   }, 500);

//   watcher.on("all", async (event, filename) => {
//     process.stdout.write(
//       chalk.reset(
//         `> ${chalk.bold(pad(event, 6))} for ${chalk.bold(
//           pad(filename, 30)
//         )}, scheduling sync\n`
//       )
//     );

//     await runDebounce();
//   });
// } else {

// }

async function sync(): Promise<void> {
  // delete all files in destination directory
  await fs.emptyDir(destinationPath);

  // copy all requested files
  await Promise.all(
    filesToCopy.map(filename => {
      const src = path.join(sourcePath, filename);
      const dest = path.join(destinationPath, filename);

      return fs.copy(src, dest);
    })
  );
}
