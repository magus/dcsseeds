exports.TKNS = buildTokenKinds({
  // special tokens (general named reference, e.g. identifiers, comments, etc.)
  EOF: { value: null },
  Identifier: { value: null },
  Whitespace: { value: null },
  Comment: { value: null },
  String: { value: null },
  Number: { value: null, re: /[0-9\.\-]/ },

  // keywords
  Static: { value: 'static' },
  Struct: { value: 'struct' },
  Const: { value: 'const' },
  Using: { value: 'using' },

  // preprocessor directives
  // see https://docs.microsoft.com/en-us/cpp/preprocessor/preprocessor-directives?view=msvc-160
  PreprocessPragma: { value: '#pragma' },
  PreprocessInclude: { value: '#include' },
  PreprocessIfStart: { value: '#if' },
  PreprocessIfEnd: { value: '#endif' },

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
  ParenStart: { value: '(' },
  ParenEnd: { value: ')' },
  ForwardSlash: { value: '/' },
  Divide: { value: '/' },
  Equals: { value: '=' },
  Assignment: { value: '=' },
  Plus: { value: '+' },
  BitwiseOr: { value: '|' },

  // special multiple character operators
  BooleanEquals: { value: '==' },
  SingleLineComment: { value: '//' },
  MultiLineComment: { value: '/*' },
  MultiLineCommentEnd: { value: '*/' },
});

function buildTokenKinds(object) {
  Object.keys(object).forEach((type) => {
    object[type].type = type;
  });

  return object;
}
