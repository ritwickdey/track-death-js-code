class Interpreter {
  constructor(visitor) {
    this.visitor = visitor;
  }
  interpret(nodes) {
    return this.visitor.run(nodes);
  }
}

class Visitor {
  visitNodes(nodes) {
    for (const node of nodes) {
      this.visitNode(node);
    }
  }
  run() {
    return this.visitNodes(body);
  }

  visitNode(node) {
    switch (node.type) {
      case "Literal":
        return this.visitLiteral(node);
      case "Identifier":
        return this.visitIdentifier(node);
      case "VariableDeclaration":
        return this.visitVariableDeclaration(node);
      case "VariableDeclarator":
        return this.visitVariableDeclarator(node);
    }
  }

  visitLiteral(node) {
    return node.value;
  }

  visitIdentifier(node) {
    const name = node.name;
    if (globalScope.get(name)) return globalScope.get(name);
    else return name;
  }
  visitVariableDeclaration(node) {
    // const nodeKind = node.kind;
    return this.visitNodes(node.declarations);
  }
  visitVariableDeclarator(node) {
    const id = this.visitNode(node.id);
    const init = this.visitNode(node.init);
    globalScope.set(id, init);
    return init;
  }
}

let globalScope = new Map();
