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
        break;
      }

      case TKNS.PreprocessInclude.kind: {
        // read and process the include preprocessor up until end of line
        next();
        while (!isTokenNext(TKNS.NewLine)) {
          next();
        }
        // eat ending new line
        next();
        break;
      }

      case TKNS.PreprocessPragma.kind: {
        // read and process the pragma preprocessor up until end of line
        next();
        while (!isTokenNext(TKNS.NewLine)) {
          next();
        }
        // eat ending new line
        next();
        break;
      }

      // continue by default
      default:
        processedTokens.push(next());
    }
  }

  return processedTokens;
};

function filterTokens(tokens) {
  return tokens.filter((t) => !DISCARD_TOKENS[t.kind]);
}

const DISCARD_TOKENS = {
  [TKNS.Whitespace.kind]: true,
  [TKNS.MultiLineComment.kind]: true,
  [TKNS.SingleLineComment.kind]: true,
};
