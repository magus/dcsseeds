#!/usr/bin/env node

const { filter } = require('lodash');
const { TKNS } = require('./TKNS');

exports.preprocessor = function preprocessor(tokens) {
  const processedTokens = [];

  // discard filtered tokens first
  tokens = filterTokens(tokens);

  let current = 0;

  function peek(i = 1) {
    if (i === 1) {
      return tokens[current];
    }

    return tokens.slice(current, current + i);
  }

  function next(i = 1) {
    let peekResult = peek(i);
    current += i;
    return peekResult;
  }

  function isTokenNext(tkn) {
    return peek().kind === tkn.kind;
  }

  while (current < tokens.length) {
    let peekToken = peek();
    switch (peekToken.kind) {
      case TKNS.PreprocessIfStart.kind: {
        // read and process the if preprocessor and the tokens it wraps
        const include = false;
        while (!isTokenNext(TKNS.PreprocessIfEnd)) {
          const token = next();
          if (include) {
            processedTokens.push(token);
          }
        }
        // eat the ending TKNS.PreprocessIfEnd
        next();
      }

      // continue by default
      default:
        processedTokens.push(next());
    }
  }

  return processedTokens;
};

function CPPParseTokenError(message, kind) {
  const error = new Error(`[${kind}] ${message}`);
  error.name = 'TokenError';
  return error;
}

function filterTokens(tokens) {
  return tokens.filter((t) => !DISCARD_TOKENS[t.kind]);
}

const DISCARD_TOKENS = {
  [TKNS.Whitespace.kind]: true,
  [TKNS.MultiLineComment.kind]: true,
  [TKNS.SingleLineComment.kind]: true,
};
