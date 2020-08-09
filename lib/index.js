const acorn = require("acorn");
const fs = require("fs");
const path = require("path");
const { createDeathFileParser } = require("./createDeathFileParser");

const startFilePath = process.argv[2];

const indexFile = (function getIndexFile() {
  const indexFile = path.resolve(process.cwd(), startFilePath);
  if (indexFile.endsWith(".js") || indexFile.endsWith(".jsx")) {
    return indexFile;
  }
  return path.join(indexFile, "index.js");
})();

const deathFileParser = createDeathFileParser();
deathFileParser.init(indexFile);
