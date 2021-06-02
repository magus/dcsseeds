#!/usr/bin/env node

const { TKNS } = require('./TKNS');

exports.lexer = function lexer(code) {
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
    let kind = tkn.kind;
    let token = { kind, value: '', row, col };
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
    if (!currentToken() || currentToken().kind !== tkn.kind) {
      createToken(tkn);
    }

    readToken(tkn);
  }

  while (peek()) {
    // keywords
    for (let i = 0; i < KYWRDS.length; i++) {
      let keyword = KYWRDS[i];
      if (isTokenNext(keyword)) {
        addToken(keyword);
      }
    }

    while (TKNS.Number.re.test(peek())) {
      continueToken(TKNS.Number);
    }

    // single line characters
    switch (peek()) {
      // new line special case; increment row and reset col
      case TKNS.NewLine.value:
        addToken(TKNS.NewLine);
        row++;
        col = 1;
        break;

      // process whitespace characters
      case TKNS.Tab.value:
      case TKNS.Space.value:
        continueToken(TKNS.Whitespace);
        break;

      case TKNS.ForwardSlash.value: {
        if (isTokenNext(TKNS.MultiLineComment)) {
          // eat the comment characters
          addToken(TKNS.MultiLineComment);

          // eat characters for comment until we hit multiline comment end
          while (!isTokenNext(TKNS.MultiLineCommentEnd)) {
            currentToken().value += next();
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
        addToken(TKNS.String);

        // eat characters inside quotes until we hit closing quote
        while (!isTokenNext(TKNS.Quote)) {
          continueToken(TKNS.String);
        }

        // add closing quote to prevent infinite loop
        continueToken(TKNS.String);
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

      // process ongoing currentToken
      default: {
        continueToken(TKNS.Identifier);
      }
    }
  }

  // insert EOF token at end
  createToken(TKNS.EOF);

  return result;
};

const KYWRDS = [
  // keywords to match immediately
  TKNS.Static,
  TKNS.Struct,
  TKNS.Const,
  TKNS.Using,
  TKNS.PreprocessPragma,
  TKNS.PreprocessInclude,
  TKNS.PreprocessIfStart,
  TKNS.PreprocessIfEnd,
];

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
