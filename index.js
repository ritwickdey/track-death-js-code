const fs = require("fs");
const path = require("path");
const { createDeathFileParser } = require("./lib/createDeathFileParser");

const startFilePath = process.argv[2];

const indexFile = (function getIndexFile() {
  const indexFile = path.resolve(process.cwd(), startFilePath);
  if (indexFile.endsWith(".js") || indexFile.endsWith(".jsx")) {
    return indexFile;
  }
  return path.join(indexFile, "index.js");
})();

const deathFileParser = createDeathFileParser();

const ignoreTestFile = true;
const { usedJsFiles, allJsfiles, unusedJsFiles } = deathFileParser.start(
  indexFile,
  {
    ignoreTestFile,
  }
);

console.log("Test files are", ignoreTestFile ? "excluded" : "included");
console.log(
  `\nUsed JS Files: ${usedJsFiles.length}, ununsed: ${unusedJsFiles.length}, Total:${allJsfiles.length}`
);

const logPath = path.join(__dirname, "log");
fs.writeFileSync(
  path.join(logPath, "usedJsFiles.json"),
  JSON.stringify(usedJsFiles, null, 2)
);
fs.writeFileSync(
  path.join(logPath, "unusedJsFiles.json"),
  JSON.stringify(unusedJsFiles, null, 2)
);

fs.writeFileSync(
  path.join(logPath, "allJsFiles.json"),
  JSON.stringify(allJsfiles, null, 2)
);

console.log(`Logs are generated into ${logPath}`);
