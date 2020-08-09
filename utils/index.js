const fs = require('fs');
const path = require('path');

function doLog({ usedJsFiles, unusedJsFiles, allJsfiles, ignoreTestFile }) {
  console.log('Test files are', ignoreTestFile ? 'excluded' : 'included');
  console.log(
    `\nUsed JS Files: ${usedJsFiles.length}, ununsed: ${unusedJsFiles.length}, Total:${allJsfiles.length}`
  );

  const logPath = path.join(__dirname, '../log');
  fs.writeFileSync(
    path.join(logPath, 'usedJsFiles.json'),
    JSON.stringify(withTime(usedJsFiles), null, 2)
  );
  fs.writeFileSync(
    path.join(logPath, 'unusedJsFiles.json'),
    JSON.stringify(withTime(unusedJsFiles), null, 2)
  );

  fs.writeFileSync(
    path.join(logPath, 'allJsFiles.json'),
    JSON.stringify(withTime(allJsfiles), null, 2)
  );

  console.log(`Logs are generated into ${logPath}`);
}

function getIndexFile(startFilePath, cwd = process.cwd()) {
  const indexFile = path.resolve(cwd, startFilePath);
  if (indexFile.endsWith('.js') || indexFile.endsWith('.jsx')) {
    return indexFile;
  }
  return path.join(indexFile, 'index.js');
}

module.exports = {
  doLog,
  getIndexFile,
};

function withTime(data) {
  return {
    time: new Date().toString(),
    files: data,
  };
}
