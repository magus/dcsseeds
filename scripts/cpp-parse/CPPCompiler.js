#!/usr/bin/env node

const { lexer } = require('./lexer');
const { preprocessor } = require('./preprocessor');
const { parser } = require('./parser');
const { traverser } = require('./traverser');

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.CPPCompiler = CPPCompiler;

function CPPCompiler(source) {
  let tokens = lexer(source);
  let { defines, processedTokens } = preprocessor(tokens);
  let ast = parser(defines, processedTokens);

  const __data = { defines, tokens, processedTokens, ast };

  function traverse(visitor) {
    traverser(ast, visitor);
  }

  return { __data, traverse };
}

CPPCompiler.TKNS = TKNS;
CPPCompiler.AST = AST;