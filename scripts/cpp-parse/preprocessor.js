#!/usr/bin/env node

const { filter } = require('lodash');
const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.preprocessor = function preprocessor(tokens, options) {
  const result = first_preprocessPass(tokens, options);

  return result;
};

function first_preprocessPass(tokens, options) {
  const defines = {};
  let processedTokens = [];

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
    return peek().type === tkn.type;
  }

  function parseDefine() {
    // eat define token
    next();

    // east whitespace
    next();

    const node = AST.Define.build({
      name: next().value, // name of define
      args: [],
      tokens: [],
    });

    // if there are args to define capture them
    if (peek().type === TKNS.ParenStart.type) {
      // eat start paren
      next();
      while (!isTokenNext(TKNS.ParenEnd)) {
        switch (peek().type) {
          // pull identifiers out into args
          case TKNS.Identifier.type:
            node.args.push(next().value);
            break;

          // eat whitespace and commas
          case TKNS.Whitespace.type:
          case TKNS.Comma.type:
            next();
            break;
          default:
            throw new PreprocessorError('Unexpected token in parseDefine', peek());
        }
      }
      // eat end paren
      next();
    }

    while (!isTokenNext(TKNS.NewLine)) {
      switch (peek().type) {
        case TKNS.Escape.type: {
          // ensure escaped new lines are skipped
          if (peek(2)[1].type === TKNS.NewLine.type) {
            // read the escaped newline and ignore it
            next(2);
          } else {
            throw new PreprocessorError('Unhandled escaped character', peek(2)[1]);
          }

          break;
        }

        // handle nested #define macros
        case TKNS.Identifier.type: {
          const defineTokens = preprocessDefine();
          if (defineTokens) {
            node.tokens.push(...defineTokens);
          } else {
            node.tokens.push(next());
          }
          break;
        }

        // ignore parens
        case TKNS.ParenStart.type:
        case TKNS.ParenEnd.type:
          next();
          break;

        default:
          // add to define tokens
          node.tokens.push(next());
      }
    }

    // discard filtered tokens
    node.tokens = filterTokens(node.tokens);

    // store defined value for parser
    defines[node.name] = node;
  }

  function preprocessDefine() {
    // is this a #define ?
    const define = defines[peek().value];
    if (!define) {
      return;
    }

    // eat the identifier which is the define name
    next();

    if (peek().type === TKNS.ParenStart.type) {
      // this is a define with args, do we have expected args?
      // console.debug('define', define.name, define.args);

      if (peek().type === TKNS.ParenStart.type) {
        function resetArg() {
          const arg = [];
          args.push(arg);
          return arg;
        }

        const args = [];
        let currentArg = resetArg();

        // eat start paren
        next();
        while (!isTokenNext(TKNS.ParenEnd)) {
          switch (peek().type) {
            // eat comma and reset arg
            case TKNS.Comma.type: {
              // eat the comma
              next();
              // reset currentArg
              currentArg = resetArg();

              break;
            }

            default:
              // capture all tokens into the current arg
              currentArg.push(next());
          }
        }
        // eat end paren
        next();

        if (args.length !== define.args.length) {
          throw new PreprocessorError('Unexpected args', { args, define });
        }

        // replace args in define.tokens and push onto processedTokens
        const definedTokens = [];
        define.tokens.forEach((token) => {
          if (token.type === TKNS.Identifier.type) {
            for (let i = 0; i < define.args.length; i++) {
              const arg = define.args[i];

              // this token is an identifier with same name as arg
              // push the parsed arg above in its place
              if (token.value === arg) {
                definedTokens.push(...clone(args[i]));
                // skip ahead and process next token
                return;
              }
            }
          }

          // if we got to this point it wasn't a named arg of the define
          // ... just forward the token
          definedTokens.push(token);
        });

        return definedTokens;
      }
    } else {
      return define.tokens;
    }

    return true;
  }

  while (current < tokens.length) {
    let peekToken = peek();
    switch (peekToken.type) {
      case TKNS.PreprocessIfStart.type:
      case TKNS.PreprocessIfNotStart.type: {
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

      // parse #define declarations
      case TKNS.PreprocessDefine.type: {
        parseDefine();
        break;
      }

      // replace #define'd identifiers with their define tokens
      case TKNS.Identifier.type: {
        const defineTokens = preprocessDefine();
        if (defineTokens) {
          processedTokens.push(...defineTokens);
        } else {
          processedTokens.push(next());
        }
        break;
      }

      case TKNS.PreprocessInclude.type: {
        // read and process the include preprocessor up until end of line
        next();
        while (!isTokenNext(TKNS.NewLine)) {
          switch (peek().type) {
            case TKNS.String.type: {
              // replace the include with the tokens included in options
              const token = next();
              const include_tokens = options.include_tokens[token.value];
              if (Array.isArray(include_tokens)) {
                processedTokens.push(...include_tokens);
              }
              break;
            }

            default:
              // eat and move along
              next();
          }
        }
        // eat ending new line
        next();
        break;
      }

      case TKNS.PreprocessPragma.type: {
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

  // discard filtered tokens
  processedTokens = filterTokens(processedTokens);

  // second pass to replace all defines
  return [processedTokens, { defines }];
}

function filterTokens(tokens) {
  return tokens.filter((t) => !DISCARD_TOKENS[t.type]);
}

const DISCARD_TOKENS = {
  [TKNS.Whitespace.type]: true,
  [TKNS.MultiLineComment.type]: true,
  [TKNS.SingleLineComment.type]: true,
};

function PreprocessorError(message, token) {
  const error = new Error(`[${JSON.stringify(token)}] ${message}`);
  error.name = 'PreprocessorError';
  return error;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
