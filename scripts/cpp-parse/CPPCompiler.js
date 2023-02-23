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

  function traverse(visitor) {
    traverser(ast, visitor);
  }

  return { traverse, defines, tokens, processedTokens, ast };
}

CPPCompiler.TKNS = TKNS;
CPPCompiler.AST = AST;
