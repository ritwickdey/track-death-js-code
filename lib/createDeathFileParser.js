const acorn = require("acorn");
const fs = require("fs");
const path = require("path");
const jsx = require("acorn-jsx");
const classFields = require("acorn-class-fields");

const staticClassFeatures = require("acorn-static-class-features");
const acormJsx = acorn.Parser.extend(staticClassFeatures, classFields, jsx());

function createDeathFileParser() {
  let _pwd = null;

  function _getFilePath(requiredFile, ...root) {
    try {
      const resovledPath = require.resolve(requiredFile, { paths: root });

      if (!/\.(js|jsx)$/i.test(resovledPath)) {
        return null;
      }

      if (resovledPath.indexOf("node_modules") !== -1) {
        return null;
      }

      if (_pwd && resovledPath.indexOf(_pwd) === -1) {
        return null;
      }

      return resovledPath;
    } catch (error) {
      if (!requiredFile.startsWith(".")) {
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
      if (node.type !== "ImportDeclaration") continue;
      const requiredFile = node.source.value;
      const filePath = _getFilePath(requiredFile, root);
      if (filePath) {
        importRoots.push(filePath);
      }
    }

    return importRoots;
  }

  function checkImports(filePath) {
    const buffer = fs.readFileSync(filePath).toString();
    const parsedTree = acormJsx.parse(buffer, {
      sourceType: "module",
      ecmaVersion: 2020,
    }).body;

    const root = path.dirname(filePath);

    const importedFiles = _fileImportDeclarations(parsedTree, { root });

    return importedFiles;
  }

  function collectAllImports(indexFilePath) {
    const filePathStacks = [indexFilePath];
    const visitedFileMap = {};

    while (filePathStacks.length) {
      const currentFilePath = filePathStacks.pop();
      console.log("Checking...", currentFilePath.replace(_pwd + "/", ""));
      const importedFiles = checkImports(currentFilePath);
      visitedFileMap[currentFilePath] = true;

      importedFiles.forEach((file) => {
        if (!visitedFileMap[file]) {
          filePathStacks.push(file);
        }
      });
    }

    const usedFiles = Object.keys(visitedFileMap);

    return usedFiles;
  }

  function init(indexFilePath) {
    _pwd = path.dirname(indexFilePath);
    const usedFiles = collectAllImports(indexFilePath);
    console.log(usedFiles.length);
  }

  return { init };
}

module.exports = {
  createDeathFileParser,
};
