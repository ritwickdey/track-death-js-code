const { createDeathFileParser } = require('./lib/createDeathFileParser');
const { getIndexFile, doLog } = require('./utils');

const ignoreTestFile = true;
const indexFile = getIndexFile(process.argv[2]);

const deathFileParser = createDeathFileParser();


const output = deathFileParser.start(indexFile, { ignoreTestFile });
doLog({ ...output, ignoreTestFile });
