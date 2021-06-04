#!/usr/bin/env node

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.parser = function parser(tokens) {
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
    return peek() && peek().type === tkn.type;
  }

  function parse() {
    let peekToken = peek();

    function parseObjectValue() {
      const node = AST.ObjectValue.build({
        values: [],
      });

      while (!isTokenNext(TKNS.Comma)) {
        if (peek().type === TKNS.CurlyBracketEnd.type) {
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
      const node = AST.Object.build({
        fields: [],
      });

      // eat bracket start to prevent infinite recursion
      next();

      while (!isTokenNext(TKNS.CurlyBracketEnd)) {
        switch (peek().type) {
          case TKNS.CurlyBracketStart.type:
            node.fields.push(parseObject());
            break;

          case TKNS.Identifier.type:
          case TKNS.String.type:
          case TKNS.Number.type: {
            node.fields.push(parseObjectValue());
            break;
          }

          // skip commas between elements
          case TKNS.Comma.type:
            next();
            break;
          // skip new lines so we can parse objects that start on next line
          case TKNS.NewLine.type:
            next();
            break;

          default:
            throw new ParserError('Unexpected token during parseObject', peek().type);
        }
      }

      // eat the closing bracket
      next();

      return node;
    }

    function parseAssignment() {
      // gather left of assignment token (keywords, types, etc.)
      const types = parseAssignmentLHS();
      // pull off identifier just before assignment token
      const [name] = types.tokens.splice(-1);
      next(); // eat assignment equal symbol
      const value = parseAssignmentRHS();

      return AST.Assignment.build({ types, name, value });
    }

    function parseAssignmentLHS() {
      const node = AST.AssignmentTypes.build({
        tokens: [],
      });

      while (!isTokenNext(TKNS.Assignment)) {
        switch (peek().type) {
          // skip new lines
          case TKNS.NewLine.type:
            next();
            break;

          default:
            node.tokens.push(next());
        }
      }

      return node;
    }

    function parseAssignmentRHS() {
      while (!isTokenNext(TKNS.Semicolon)) {
        switch (peek().type) {
          case TKNS.CurlyBracketStart.type:
            return parseObject();
            break;
          // skip new lines so we can parse objects that start on next line
          case TKNS.NewLine.type:
            next();
            break;

          default:
            throw new ParserError('Unexpected token during parseAssignmentRHS', peek());
        }
      }
    }

    function parseCallExpression() {
      const node = AST.CallExpression.build({
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
      const node = AST.Expression.build({
        params: [],
      });

      while (!isTokenNext(TKNS.Semicolon) && !isTokenNext(TKNS.Comma) && !isTokenNext(TKNS.NewLine)) {
        // handle double equals
        if (isTokenNext(TKNS.BooleanEquals)) {
          node.params.push(next());
          continue;
        }

        switch (peek().type) {
          case TKNS.Identifier.type: {
            const parenAfterNext = peek(2)[1].type === TKNS.ParenStart.type;
            if (parenAfterNext) {
              node.params.push(parseCallExpression());
            } else {
              node.params.push(next());
            }
            break;
          }

          case TKNS.Plus.type:
          case TKNS.Number.type:
            node.params.push(next());
            break;

          // kick out to let parent handle paren closing
          case TKNS.ParenEnd.type:
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
    if (peek(6).find((t) => t.type === TKNS.Assignment.type)) {
      return parseAssignment();
    }

    switch (peekToken.type) {
      case TKNS.Using.type: {
        next();
        const node = AST.Using.build({
          tokens: [],
        });

        while (!isTokenNext(TKNS.NewLine) && !isTokenNext(TKNS.Semicolon)) {
          node.tokens.push(next());
        }
        return node;
      }

      case TKNS.Identifier.type: {
        return parseExpression();
      }

      // skip these tokens
      case TKNS.NewLine.type:
      case TKNS.Semicolon.type:
        next();
        return;
      // EOF continue to end
      case TKNS.EOF.type:
        next();
        return;

      default:
        throw new ParserError('Unexpected token during parse', peekToken);
    }
  }

  // kickoff building the ast program
  const ast = AST.Program.build({
    body: [],
  });

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
