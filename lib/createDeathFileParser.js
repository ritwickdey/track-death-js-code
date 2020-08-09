const acorn = require('acorn');
const fs = require('fs');
const path = require('path');
const jsx = require('acorn-jsx');
const classFields = require('acorn-class-fields');
const glob = require('glob');

const staticClassFeatures = require('acorn-static-class-features');

const acormJsx = acorn.Parser.extend(staticClassFeatures, classFields, jsx());

function createDeathFileParser() {
  let _pwd = null;
  const visitedFileMap = {};

  function _getFilePath(requiredFile, ...root) {
    try {
      const resovledPath = require.resolve(requiredFile, { paths: root });

      if (!/\.(js|jsx)$/i.test(resovledPath)) {
        return null;
      }

      if (resovledPath.indexOf('node_modules') !== -1) {
        return null;
      }

      if (_pwd && resovledPath.indexOf(_pwd) === -1) {
        return null;
      }

      return resovledPath;
    } catch (error) {
      if (!requiredFile.startsWith('.')) {
        //means file is under node_module.
        return null;
      }
      throw new Error(error);
    }
  }

  function _fileImportDeclarations(nodes, { root }) {
    const importRoots = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (
        node.type === 'ImportDeclaration' ||
        node.type === 'ExportAllDeclaration' ||
        node.type === 'ExportNamedDeclaration'
      ) {
        if (!node.source) {
          // exported as function
          continue;
        }
        const requiredFile = node.source.value;
        const filePath = _getFilePath(requiredFile, root);
        if (filePath) {
          importRoots.push(filePath);
        }
      }
    }

    return importRoots;
  }

  function checkImports(filePath) {
    const buffer = fs.readFileSync(filePath).toString();
    const parsedTree = acormJsx.parse(buffer, {
      sourceType: 'module',
      ecmaVersion: 2020,
    }).body;

    const root = path.dirname(filePath);

    const importedFiles = _fileImportDeclarations(parsedTree, { root });

    return importedFiles;
  }

  function collectAllImports(...indexFilePath) {
    const filePathStacks = [...indexFilePath];

    while (filePathStacks.length) {
      const currentFilePath = filePathStacks.pop();
      const importedFiles = checkImports(currentFilePath);
      visitedFileMap[currentFilePath] = true;

      importedFiles.forEach((file) => {
        if (!visitedFileMap[file]) {
          filePathStacks.push(file);
        }
      });
      
      console.log(
        `Checked: ${Object.keys(visitedFileMap).length} files, remaining: ${
          filePathStacks.length
        }`
      );
    }

    return visitedFileMap;
  }

  function start(indexFilePath, { pwd, ignoreTestFile = false } = {}) {
    _pwd = pwd || path.dirname(indexFilePath);

    const TEST_FILES = [
      'setupTests.js',
      '**/__tests__/*.js',
      '**/__tests__/*.jsx',
      '**/__test__/*.js',
      '**/__test__/*.jsx',
      '**/test/*.js',
      '**/test/*.jsx',
      '**/*.test.js',
      '**/*.test.jsx',
    ];

    const testFiles = ignoreTestFile
      ? []
      : glob.sync(`{${TEST_FILES.join(',')}}`, {
          cwd: _pwd,
          realpath: ['**/node_modules/**'],
        });

    collectAllImports(indexFilePath, ...testFiles);

    const allJsfiles = glob.sync('**/*.{js,jsx}', {
      cwd: _pwd,
      ignore: ignoreTestFile
        ? ['**/node_modules/**', ...TEST_FILES]
        : ['**/node_modules/**'],
    });

    const deleteList = [];
    for (let i = 0; i < allJsfiles.length; i++) {
      const filePath = path.join(_pwd, allJsfiles[i]);
      if (!visitedFileMap[filePath]) {
        deleteList.push(filePath);
      }
    }

    return {
      usedJsFiles: Object.keys(visitedFileMap),
      allJsfiles,
      unusedJsFiles: deleteList,
    };
  }

  return { start: start };
}

module.exports = {
  createDeathFileParser,
};
