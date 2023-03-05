#!/usr/bin/env node

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.traverser = function traverser(ast, visitor) {
  // A `traverseArray` function that will allow us to iterate over an array and
  // call the next function that we will define: `traverseNode`.
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  // `traverseNode` will accept a `node` and its `parent` node. So that it can
  // pass both to our visitor methods.
  function traverseNode(node, parent) {
    // We start by testing for the existence of a method on the visitor with a
    // matching `type`.
    let methods = visitor[node.type];

    // If there is an `enter` method for this node type we'll call it with the
    // `node` and its `parent`.
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    // Next we are going to split things up by the current node type.
    switch (node.type) {
      // We'll start with our top level `Program`. Since Program nodes have a
      // property named body that has an array of nodes, we will call
      // `traverseArray` to traverse down into them.
      //
      // (Remember that `traverseArray` will in turn call `traverseNode` so  we
      // are causing the tree to be traversed recursively)
      case 'Program':
        traverseArray(node.body, node);
        break;

      // Next we do the same with `Expression` and `CallExpression` and traverse their `params`.
      case 'Expression':
      case 'CallExpression':
        traverseArray(node.params, node);
        break;

      // These nodes do not have any child nodes to visit, so we break
      case AST.Using.type:
      case AST.Enum.type:
      case AST.Assignment.type:
      case TKNS.Plus.type:
      case TKNS.BooleanEquals.type:
      case TKNS.Identifier.type:
      case TKNS.Number.type:
      case TKNS.Function.type:
      case TKNS.Struct.type:
        break;

      // And again, if we haven't recognized the node type then we'll throw an
      // error.
      default:
        throw new TraverserError(node);
    }

    // If there is an `exit` method for this node type we'll call it with the
    // `node` and its `parent`.
    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }

  // Finally we kickstart the traverser by calling `traverseNode` with our ast
  // with no `parent` because the top level of the AST doesn't have a parent.
  traverseNode(ast, null);
};

function TraverserError(node) {
  const error = new TypeError(`[${node.type}] unexpected (${JSON.stringify(node)})`);
  error.name = 'TraverserError';
  return error;
}
