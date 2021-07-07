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
        while (!isTokenNext(TKNS.Quote)) {
          continueToken(TKNS.String);
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
        while (!isTokenNext(TKNS.SingleQuote)) {
          continueToken(TKNS.String);
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

      // process ongoing currentToken
      default: {
        continueToken(TKNS.Identifier);
      }
    }
  }

  // insert EOF token at end
  createToken(TKNS.EOF);

  // convert any token values from strings (e.g. numbers)
  result.forEach((token) => {
    switch (token.type) {
      case TKNS.Number.type:
        token.value = Number(token.value);
        break;
      case TKNS.BooleanTrue.type:
      case TKNS.BooleanFalse.type:
        token.value = Boolean(token.value);
        break;
      default:
      // do nothing
    }
  });

  return result;
};

const KYWRDS = [
  // keywords to match immediately
  TKNS.Static,
  TKNS.Struct,
  TKNS.Const,
  TKNS.Using,
  TKNS.BooleanTrue,
  TKNS.BooleanFalse,
  TKNS.PreprocessDefine,
  TKNS.PreprocessPragma,
  TKNS.PreprocessInclude,
  TKNS.PreprocessIfStart,
  TKNS.PreprocessIfEnd,
];

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}