exports.TKNS = buildTokenKinds({
  // special tokens (general named reference, e.g. identifiers, comments, etc.)
  EOF: { value: null },
  Identifier: { value: null },
  Whitespace: { value: null },
  Comment: { value: null },
  String: { value: null },
  Number: { value: null, re: /[0-9.-]/ },

  // keywords
  If: { value: 'if' },
  Else: { value: 'else' },
  For: { value: 'for' },
  Return: { value: 'return' },
  Static: { value: 'static' },
  Struct: { value: 'struct' },
  Const: { value: 'const' },
  TypeVoid: { value: 'void' },
  TypeBool: { value: 'bool' },
  TypeInt: { value: 'int' },
  TypeString: { value: 'string' },
  Function: { value: 'function' },
  Enum: { value: 'enum' },
  Using: { value: 'using' },
  BooleanTrue: { value: 'true' },
  BooleanFalse: { value: 'false' },

  // preprocessor directives
  // see https://docs.microsoft.com/en-us/cpp/preprocessor/preprocessor-directives?view=msvc-160
  PreprocessDefine: { value: '#define' },
  PreprocessPragma: { value: '#pragma' },
  PreprocessInclude: { value: '#include' },
  PreprocessIfStart: { value: '#if' },
  PreprocessIfNotStart: { value: '#ifndef' },
  PreprocessIfEnd: { value: '#endif' },

  // single characters
  Escape: { value: '\\' },
  NewLine: { value: '\n' },
  Tab: { value: '\t' },
  Space: { value: ' ' },
  Semicolon: { value: ';' },
  Comma: { value: ',' },
  Quote: { value: '"' },
  SingleQuote: { value: "'" },
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
