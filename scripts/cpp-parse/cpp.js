#!/usr/bin/env node

const { lexer } = require('./lexer');
const { preprocessor } = require('./preprocessor');
const { parser } = require('./parser');

exports.cpp = function cpp(source) {
  let tokens = lexer(source);
  let processedTokens = preprocessor(tokens);
  let ast = parser(processedTokens);

  return { tokens, processedTokens, ast };
};
