#!/usr/bin/env node

const { TKNS } = require('./TKNS');

exports.lexer = function lexer(code, options = {}) {
  const result = [];

  const currentToken = () => result[result.length - 1];

  let c = 0;
  let row = 1;
  let col = 1;

  function peek(i = 1) {
    return code.substr(c, i);
  }

  function next(i = 1) {
    let chars = peek(i);

    c += i;
    col += i;

    return chars;
  }

  function isTokenNext(tkn) {
    return peek(tkn.value.length) === tkn.value;
  }

  function createToken(tkn) {
    let type = tkn.type;
    let token = { type, value: '', row, col };
    result.push(token);
  }

  function readToken(tkn) {
    let length = tkn.value ? tkn.value.length : 1;
    currentToken().value += next(length);
  }

  function addToken(tkn) {
    createToken(tkn);
    readToken(tkn);
  }

  function continueToken(tkn) {
    if (!currentToken() || currentToken().type !== tkn.type) {
      createToken(tkn);
    }

    readToken(tkn);
  }

  function handleNewLine() {
    row++;
    col = 1;
  }

  while (peek()) {
    // only parse numbers when they are not inside an identifier
    if (currentToken() && currentToken().type !== TKNS.Identifier.type) {
      while (TKNS.Number.re.test(peek())) {
        continueToken(TKNS.Number);
      }
    }

    // single character tokens
    switch (peek()) {
      // new line special case; increment row and reset col
      case TKNS.NewLine.value:
        addToken(TKNS.NewLine);
        handleNewLine();
        break;

      // process whitespace characters
      case TKNS.Tab.value:
      case TKNS.Space.value:
        continueToken(TKNS.Whitespace);
        break;

      case TKNS.Escape.value: {
        addToken(TKNS.Escape);
        break;
      }

      case TKNS.ForwardSlash.value: {
        if (isTokenNext(TKNS.MultiLineComment)) {
          // eat the comment characters
          addToken(TKNS.MultiLineComment);

          // eat characters for comment until we hit multiline comment end
          while (!isTokenNext(TKNS.MultiLineCommentEnd)) {
            switch (peek()) {
              case TKNS.NewLine.value:
                handleNewLine();
              default:
                currentToken().value += next();
            }
          }
          currentToken().value += next(TKNS.MultiLineCommentEnd.value.length);
        } else if (isTokenNext(TKNS.SingleLineComment)) {
          // eat the two comment characters
          addToken(TKNS.SingleLineComment);

          // eat characters for comment until we hit a new line
          while (!isTokenNext(TKNS.NewLine)) {
            currentToken().value += next();
          }
        } else {
          addToken(TKNS.Divide);
        }
        break;
      }

      case TKNS.Quote.value: {
        // eat the quote character that starts the string
        next();
        // begin empty string token
        createToken(TKNS.String);

        // eat characters inside quotes until we hit closing quote
        let ended = false;
        while (!ended) {
          switch (true) {
            case isTokenNext(TKNS.Quote):
              ended = true;
              break;

            // include escaped characters inside string
            case isTokenNext(TKNS.Escape): {
              next(TKNS.Escape.length);
              continueToken(TKNS.String);
              break;
            }

            default:
              continueToken(TKNS.String);
          }
        }

        // eat closing quote to prevent infinite loop
        next();
        break;
      }

      case TKNS.SingleQuote.value: {
        // eat the quote character that starts the string
        next();
        // begin empty string token
        createToken(TKNS.String);

        // eat characters inside quotes until we hit closing quote
        let ended = false;
        while (!ended) {
          switch (true) {
            case isTokenNext(TKNS.SingleQuote):
              ended = true;
              break;

            // include escaped characters inside string
            case isTokenNext(TKNS.Escape): {
              next(TKNS.Escape.length);
              continueToken(TKNS.String);
              break;
            }

            default:
              continueToken(TKNS.String);
          }
        }

        // eat closing quote to prevent infinite loop
        next();
        break;
      }

      case TKNS.Equals.value:
        if (isTokenNext(TKNS.BooleanEquals)) {
          addToken(TKNS.BooleanEquals);
        } else {
          addToken(TKNS.Assignment);
        }
        break;
      case TKNS.CurlyBracketStart.value:
        addToken(TKNS.CurlyBracketStart);
        break;
      case TKNS.CurlyBracketEnd.value:
        addToken(TKNS.CurlyBracketEnd);
        break;
      case TKNS.ParenStart.value:
        addToken(TKNS.ParenStart);
        break;
      case TKNS.ParenEnd.value:
        addToken(TKNS.ParenEnd);
        break;
      case TKNS.Plus.value:
        addToken(TKNS.Plus);
        break;
      case TKNS.BitwiseOr.value:
        addToken(TKNS.BitwiseOr);
        break;
      case TKNS.Comma.value:
        addToken(TKNS.Comma);
        break;
      case TKNS.Semicolon.value:
        addToken(TKNS.Semicolon);
        break;
      case TKNS.AngleBracketStart.value:
        addToken(TKNS.AngleBracketStart);
        break;
      case TKNS.AngleBracketEnd.value:
        addToken(TKNS.AngleBracketEnd);
        break;

      // process ongoing currentToken
      default: {
        continueToken(TKNS.Identifier);
      }
    }
  }

  // insert EOF token at end
  if (!options.omit_EOF) {
    createToken(TKNS.EOF);
  }

  // convert any token values from strings (e.g. numbers)
  result.forEach((token) => {
    switch (token.type) {
      case TKNS.Number.type:
        token.value = Number(token.value);
        break;

      case TKNS.BooleanTrue.type:
      case TKNS.BooleanFalse.type:
        token.value = JSON.parse(token.value);
        break;

      case TKNS.Identifier.type: {
        // convert identifiers to known keywords
        for (const keyword of KYWRDS) {
          if (token.value === keyword.value) {
            token.type = keyword.type;
          }
        }
        break;
      }

      default:
      // do nothing
    }
  });

  return result;
};

const KYWRDS = [
  // keywords to match immediately
  TKNS.If,
  TKNS.Else,
  TKNS.Return,
  TKNS.Static,
  TKNS.Struct,
  TKNS.Const,
  TKNS.TypeVoid,
  TKNS.TypeBool,
  TKNS.TypeInt,
  TKNS.TypeString,
  TKNS.Function,
  TKNS.Enum,
  TKNS.Using,
  TKNS.BooleanTrue,
  TKNS.BooleanFalse,
  TKNS.PreprocessDefine,
  TKNS.PreprocessPragma,
  TKNS.PreprocessInclude,
  TKNS.PreprocessIfStart,
  TKNS.PreprocessIfNotStart,
  TKNS.PreprocessIfEnd,
];

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
