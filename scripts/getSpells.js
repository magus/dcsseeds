#!/usr/bin/env node

const fs = require('fs').promises;

// cd projRoot/crawl
// git checkout <version>
// grab spellbook data from crawl-ref/source/book-data.h
// grab spell data from crawl-ref/source/spl-data.h
// build list of all spells currently available in spellbooks
// if a spell is not available in spellbook we can consider it not in the game

(async function run() {
  let code = await readFile('./crawl/crawl-ref/source/book-data.h');
  let tokens = tokenize(code);
  console.info({ tokens });
})();

function tokenize(code) {
  let result = [];

  let row = 1;
  let col = 1;

  let c = 0;

  const currentToken = () => result[result.length - 1];

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
        if (isTokenNext(TKNS.SingleLineComment)) {
          // eat the two comment characters
          addToken(TKNS.SingleLineComment);

          // eat characters for comment until we hit a new line
          while (!isTokenNext(TKNS.NewLine)) {
            continueToken(TKNS.Comment);
          }
        } else {
          addToken(TKNS.Divide);
        }
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

  return result;
}

const TKNS = buildTokenKinds({
  // special tokens (general named reference, e.g. identifiers, comments, etc.)
  Identifier: { value: null },
  Whitespace: { value: null },
  Comment: { value: null },

  // keywords
  Pragma: { value: '#pragma' },
  IncludeLib: { value: '#include' },
  IfDef: { value: '#if' },
  IfDefEnd: { value: '#endif' },
  Using: { value: 'using' },

  // single characters
  NewLine: { value: '\n' },
  Tab: { value: '\t' },
  Space: { value: ' ' },
  Semicolon: { value: ';' },
  Comma: { value: ',' },
  Quote: { value: '"' },
  AngleBracketStart: { value: '<' },
  AngleBracketEnd: { value: '>' },
  CurlyBracketStart: { value: '{' },
  CurlyBracketEnd: { value: '}' },
  ForwardSlash: { value: '/' },
  Divide: { value: '/' },
  Equals: { value: '=' },
  Assignment: { value: '=' },

  // special multiple character operators
  BooleanEquals: { value: '==' },
  SingleLineComment: { value: '//' },
});

function buildTokenKinds(object) {
  Object.keys(object).forEach((key) => {
    object[key].kind = key;
  });

  return object;
}

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
