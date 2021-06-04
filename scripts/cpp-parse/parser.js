#!/usr/bin/env node

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.parser = function parser(tokens) {
  const ast = AST.Program({
    body: [],
  });

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
    return peek() && peek().kind === tkn.kind;
  }

  function parse() {
    let peekToken = peek();

    function parseObjectValue() {
      const node = AST.ObjectValue({
        values: [],
      });

      while (!isTokenNext(TKNS.Comma)) {
        if (peek().kind === TKNS.CurlyBracketEnd.kind) {
          // kick out back to object
          return node;
        }

        node.values.push(next());
      }

      // eat comma
      next();

      return node;
    }

    function parseObject() {
      const node = AST.Object({
        fields: [],
      });

      // eat bracket start to prevent infinite recursion
      next();

      while (!isTokenNext(TKNS.CurlyBracketEnd)) {
        switch (peek().kind) {
          case TKNS.CurlyBracketStart.kind:
            node.fields.push(parseObject());
            break;

          case TKNS.Identifier.kind:
          case TKNS.String.kind:
          case TKNS.Number.kind: {
            node.fields.push(parseObjectValue());
            break;
          }

          // skip commas between elements
          case TKNS.Comma.kind:
            next();
            break;
          // skip new lines so we can parse objects that start on next line
          case TKNS.NewLine.kind:
            next();
            break;

          default:
            throw new ParserError('Unexpected token during parseObject', peek().kind);
        }
      }

      // eat the closing bracket
      next();

      return node;
    }

    function parseAssignmentName() {
      const node = AST.AssignmentName({
        tokens: [],
      });

      while (!isTokenNext(TKNS.Assignment)) {
        node.tokens.push(next());
      }

      return node;
    }

    function parseAssignmentValue() {
      const node = AST.AssignmentValue({
        value: null,
      });

      while (!isTokenNext(TKNS.Semicolon)) {
        switch (peek().kind) {
          case TKNS.CurlyBracketStart.kind:
            node.value = parseObject();
            break;
          // skip new lines so we can parse objects that start on next line
          case TKNS.NewLine.kind:
            next();
            break;

          default:
            throw new ParserError('Unexpected token during parseAssignmentValue', peek());
        }
      }

      return node;
    }

    function parseCallExpression() {
      const node = AST.CallExpression({
        name: next(), // eat the identifier as the name
        params: [],
      });

      // eat open paren
      next();

      while (!isTokenNext(TKNS.ParenEnd)) {
        node.params.push(parseExpression());
      }

      // eat closing paren
      next();

      return node;
    }

    function parseExpression() {
      const node = AST.Expression({
        params: [],
      });

      while (!isTokenNext(TKNS.Semicolon) && !isTokenNext(TKNS.Comma) && !isTokenNext(TKNS.NewLine)) {
        // handle double equals
        if (isTokenNext(TKNS.BooleanEquals)) {
          node.params.push(next());
          continue;
        }

        switch (peek().kind) {
          case TKNS.Identifier.kind: {
            const parenAfterNext = peek(2)[1].kind === TKNS.ParenStart.kind;
            if (parenAfterNext) {
              node.params.push(parseCallExpression());
            } else {
              node.params.push(next());
            }
            break;
          }

          case TKNS.Plus.kind:
          case TKNS.Number.kind:
            node.params.push(next());
            break;

          // kick out to let parent handle paren closing
          case TKNS.ParenEnd.kind:
            return node;
            break;

          default:
            console.debug(JSON.stringify(node));
            throw new ParserError('Unexpected token during parseExpression', peek());
        }
      }

      // eat ending semicolon or comma
      next();

      return node;
    }

    // look ahead for assignments (5 token lookahead for now)
    if (peek(6).find((t) => t.kind === TKNS.Assignment.kind)) {
      const name = parseAssignmentName();
      next(); // eat assignment equal symbol
      const value = parseAssignmentValue();

      return AST.Assignment({ name, value });
    }

    switch (peekToken.kind) {
      case TKNS.Using.kind: {
        next();
        const node = AST.Using({
          tokens: [],
        });

        while (!isTokenNext(TKNS.NewLine) && !isTokenNext(TKNS.Semicolon)) {
          node.tokens.push(next());
        }
        return node;
      }

      case TKNS.Identifier.kind: {
        return parseExpression();
      }

      // skip these tokens
      case TKNS.NewLine.kind:
      case TKNS.Semicolon.kind:
        next();
        return;
      // EOF continue to end
      case TKNS.EOF.kind:
        next();
        return;

      default:
        throw new ParserError('Unexpected token during parse', peekToken);
    }
  }

  while (current < tokens.length) {
    const node = parse();

    if (node) {
      ast.body.push(node);
    }
  }

  return ast;
};

function ParserError(message, token) {
  const error = new Error(`[${JSON.stringify(token)}] ${message}`);
  error.name = 'ParserError';
  return error;
}
