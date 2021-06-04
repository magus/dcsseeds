#!/usr/bin/env node

const { lexer } = require('./lexer');
const { preprocessor } = require('./preprocessor');
const { parser } = require('./parser');
const { traverser } = require('./traverser');

exports.CPPCompiler = function CPPCompiler(source) {
  let tokens = lexer(source);
  let processedTokens = preprocessor(tokens);
  let ast = parser(processedTokens);

  const __data = { tokens, processedTokens, ast };

  function traverse(visitor) {
    traverser(ast, visitor);
  }

  return { __data, traverse };
};
