#!/usr/bin/env node

const { lexer } = require('./lexer');
const { preprocessor } = require('./preprocessor');
const { parser } = require('./parser');
const { traverser } = require('./traverser');

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.CPPCompiler = CPPCompiler;

function process_include_tokens(options) {
  const include = options.include || {};

  const include_tokens = {};

  for (const filepath of Object.keys(include)) {
    const source = include[filepath];
    const unprocessed_tokens = lexer(source, { omit_EOF: true });
    let [tokens, { defines }] = preprocessor(unprocessed_tokens, { include_tokens });
    include_tokens[filepath] = tokens;
  }

  return include_tokens;
}

function CPPCompiler(source, options = {}) {
  const include_tokens = process_include_tokens(options);

  let unprocessed_tokens = lexer(source);
  let [tokens, { defines }] = preprocessor(unprocessed_tokens, { include_tokens });
  let ast = parser(tokens, { defines });

  function traverse(visitor) {
    traverser(ast, visitor);
  }

  return { traverse, defines, tokens, ast };
}

CPPCompiler.TKNS = TKNS;
CPPCompiler.AST = AST;
