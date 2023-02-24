#!/usr/bin/env node

const { TKNS } = require('./TKNS');
const { AST } = require('./AST');

exports.parser = function parser(defines, tokens) {
  let current = 0;

  function peek(i = 1) {
    if (i === 1) {
      return tokens[current];
    }

    return tokens.slice(current, current + i);
  }

  function peek_at(i) {
    return tokens[i];
  }

  function next(i = 1) {
    let peekResult = peek(i);
    current += i;
    return peekResult;
  }

  function isTokenNext(tkn) {
    return peek() && peek().type === tkn.type;
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

        // skip commas between elements
        case TKNS.Comma.type:
          next();
          break;

        // skip new lines so we can parse objects that start on next line
        case TKNS.NewLine.type:
          next();
          break;

        default: {
          // push expression into object fields
          node.fields.push(parseExpression());
        }
      }
    }

    // eat the closing bracket
    next();

    // skip commas immediately after object (included array elements, e.g. art-data.h)
    if (peek().type === TKNS.Comma.type) {
      next();
    }

    return node;
  }

  function parseEnum() {
    const node = AST.Enum.build({
      name: null,
      values: [],
    });

    // eat enum keyword
    next();

    // this is the name of enum type
    node.name = next();

    // eat up until CurlyBracketStart
    while (!isTokenNext(TKNS.CurlyBracketStart)) {
      next();
    }
    // eat the opening curly bracket
    next();

    while (!isTokenNext(TKNS.CurlyBracketEnd)) {
      switch (peek().type) {
        case TKNS.Identifier.type:
          const name = next();

          // look ahead for assignment (default value)
          if (peek().type === TKNS.Assignment.type) {
            // eat assignment
            next();
            // grab value
            const value = next().value;
            node.values.push({ name, value });
          } else {
            node.values.push({ name });
          }
          break;

        // skip commas between elements
        case TKNS.Comma.type:
          next();
          break;

        // skip new lines so we can parse objects that start on next line
        case TKNS.NewLine.type:
          next();
          break;

        default: {
          throw new ParserError('Unexpected token during parseEnum');
        }
      }
    }

    // eat the closing curly bracket
    next();

    return node;
  }

  function parseStruct() {
    const node = AST.Struct.build({
      name: null,
      values: [],
    });

    // eat struct keyword
    next();

    // this is the name of struct type
    node.name = next();

    // eat up until CurlyBracketStart
    while (!isTokenNext(TKNS.CurlyBracketStart)) {
      next();
    }
    // eat the opening curly bracket
    next();

    while (!isTokenNext(TKNS.CurlyBracketEnd)) {
      switch (peek().type) {
        case TKNS.AngleBracketStart.type:
        case TKNS.AngleBracketEnd.type:
        case TKNS.ParenStart.type:
        case TKNS.ParenEnd.type:
        case TKNS.Const.type:
        case TKNS.Function.type:
        case TKNS.TypeVoid.type:
        case TKNS.TypeBool.type:
        case TKNS.TypeInt.type:
        case TKNS.TypeString.type:
        case TKNS.Identifier.type:
          const name = next();
          node.values.push(name);

          break;

        // skip semicolons between elements
        case TKNS.Semicolon.type:
          next();
          break;

        // skip new lines so we can parse objects that start on next line
        case TKNS.NewLine.type:
          next();
          break;

        default: {
          throw new ParserError('Unexpected token during parseStruct');
        }
      }
    }

    // eat the closing curly bracket
    next();
    // eat the semicolon
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
          return parseExpression();
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
      // eat commas
      if (isTokenNext(TKNS.Comma)) {
        next();
      }
    }

    // eat closing paren
    next();

    return node;
  }

  function parseExpression() {
    const node = AST.Expression.build({
      params: [],
    });

    let ended = false;

    while (peek() && !ended) {
      // handle double equals
      if (isTokenNext(TKNS.BooleanEquals)) {
        node.params.push(next());
        continue;
      }

      switch (peek().type) {
        // kick back out, let parent handle closing element
        case TKNS.Comma.type:
        case TKNS.CurlyBracketEnd.type:
        case TKNS.ParenEnd.type: {
          ended = true;
          break;
        }

        case TKNS.Semicolon.type: {
          ended = true;
          // eat ending character
          next();
          break;
        }

        // skip new lines
        case TKNS.NewLine.type: {
          next();
          break;
        }

        case TKNS.CurlyBracketStart.type:
          // start a new nested object
          node.params.push(parseObject());
          break;

        // nested expression
        case TKNS.ParenStart.type: {
          // eat open paren
          next();
          node.params.push(parseExpression());
          // eat closing paren
          next();
          break;
        }

        case TKNS.Identifier.type: {
          const parenAfterNext = peek(2)[1].type === TKNS.ParenStart.type;
          if (parenAfterNext) {
            // call expression, e.g. functionName(...)
            node.params.push(parseCallExpression());
          } else {
            node.params.push(next());
          }
          break;
        }

        case TKNS.Return.type:
        case TKNS.TypeBool.type:
        case TKNS.TypeInt.type:
        case TKNS.TypeString.type:
        case TKNS.AngleBracketStart.type:
        case TKNS.AngleBracketEnd.type:
        case TKNS.BooleanTrue.type:
        case TKNS.BooleanFalse.type:
        case TKNS.String.type:
        case TKNS.Number.type:
        case TKNS.Plus.type:
        case TKNS.Divide.type:
        case TKNS.BitwiseOr.type: {
          node.params.push(next());
          break;
        }

        default:
          console.debug('parseExpression node', JSON.stringify(node));
          throw new ParserError('Unexpected token during parseExpression');
      }
    }

    return node;
  }

  function parseUsing() {
    next();
    const node = AST.Using.build({
      tokens: [],
    });

    while (!isTokenNext(TKNS.NewLine) && !isTokenNext(TKNS.Semicolon)) {
      node.tokens.push(next());
    }
    return node;
  }

  function parseFunction(func_def) {
    const [maybe_func_node, skip_count] = func_def;

    // swallow the nodes used in function definition
    for (let i = 0; i < skip_count; i++) {
      next();
    }

    // swallow closing paren of function params
    next();

    // swallow up to opening curly bracket to start function body
    while (!isTokenNext(TKNS.CurlyBracketStart) && !isTokenNext(TKNS.Semicolon)) {
      switch (peek().type) {
        // consume new lines only
        case TKNS.NewLine.type:
          next();
          break;

        default:
          throw new ParserError('Function definition must end with curly bracket or semicolon');
      }
    }

    switch (peek().type) {
      case TKNS.Semicolon.type:
        break;

      case TKNS.CurlyBracketStart.type: {
        // swallow the opening curly brace and begin curly brace counter
        next();
        let curly_bracket_count = 1;

        while (curly_bracket_count > 0) {
          // console.debug('curly body check', peek());
          switch (peek().type) {
            case TKNS.CurlyBracketStart.type: {
              curly_bracket_count += 1;
              break;
            }
            case TKNS.CurlyBracketEnd.type: {
              curly_bracket_count -= 1;
              break;
            }
            default:
            // noop
          }

          if (curly_bracket_count !== 0) {
            maybe_func_node.body.push(next());
          }
        }

        // eat final closing bracket
        next();
        break;
      }

      default:
        throw new ParserError('Unexpected function body');
    }

    return maybe_func_node;
  }

  function capture_statement(start) {
    let ahead = start;
    let statement = [];
    let ended = false;

    while (!ended && peek_at(ahead)) {
      statement.push(peek_at(ahead));
      if (peek_at(ahead).type === TKNS.Semicolon.type) {
        ended = true;
      }
      ahead++;
    }

    return statement;
  }

  function parse() {
    switch (peek().type) {
      case TKNS.Using.type:
        return parseUsing();

      case TKNS.Enum.type:
        return parseEnum();

      case TKNS.Struct.type:
        return parseStruct();

      case TKNS.Static.type:
      case TKNS.Const.type:
      case TKNS.TypeVoid.type:
      case TKNS.TypeBool.type:
      case TKNS.TypeInt.type:
      case TKNS.TypeString.type:
      case TKNS.Identifier.type: {
        // look ahead at full statement for assignments
        // capture_statement looks ahead to semicolon
        const statement = capture_statement(current);

        if (assignment_statement(statement)) {
          return parseAssignment();
        }

        const maybe_func_def = function_definition(statement);
        if (maybe_func_def) {
          return parseFunction(maybe_func_def);
        }

        return parseExpression();
      }

      // TODO remove this once we can handle include
      // parse artefact.cc (which includes art-data.h)
      // so no need to parse top-level objects incorrectly
      case TKNS.CurlyBracketStart.type:
        return parseObject();

      // skip these tokens
      case TKNS.NewLine.type:
      case TKNS.Semicolon.type:
      // EOF continue to end
      case TKNS.EOF.type:
        next();
        return;

      default:
        throw new ParserError('Unexpected token during parse');
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

  function debug_tokens(debug_delta = 4) {
    console.debug();
    console.debug();
    tokens.slice(Math.max(0, current - debug_delta), current).forEach((t) => {
      console.debug('  ', t);
    });
    console.debug('❗️', peek());
    tokens.slice(current + 1, current + debug_delta + 1).forEach((t) => {
      console.debug('  ', t);
    });
  }

  function debug_ast(body_delta = 1) {
    console.debug();
    console.debug();

    console.dir(ast.body.slice(-1 * body_delta), { depth: null });
  }

  function ParserError(message, token = peek()) {
    debug_ast();
    debug_tokens();

    const error = new Error(`[${JSON.stringify(token)}] ${message}`);
    error.name = 'ParserError';
    return error;
  }
};

function function_definition(statement) {
  const node = AST.Function.build({
    name: null,
    return_type: null,
    params: [],
    body: [],
  });

  let identifier_paren = -1;
  let function_brace = -1;
  let function_defintion_end = -1;
  let paren_count = 0;

  for (let i = 0; i < statement.length; i++) {
    const token = statement[i];

    if (identifier_paren === -1 && token.type === TKNS.Identifier.type) {
      node.name = token;
      node.return_type = statement[i - 1];

      // function must have valid return type
      const is_valid_return = (function () {
        if (!node.return_type) {
          return false;
        }

        switch (node.return_type.type) {
          case TKNS.TypeVoid.type:
          case TKNS.TypeBool.type:
          case TKNS.TypeInt.type:
          case TKNS.TypeString.type:
          case TKNS.Identifier.type:
            return true;
          default:
            return false;
        }
      })();

      if (is_valid_return) {
        identifier_paren = i + 1;
      }
    } else if (i === identifier_paren) {
      // paren must immediately follow identifier, reset otherwise
      if (token.type === TKNS.ParenStart.type) {
        paren_count = 1;
      } else {
        identifier_paren = -1;
      }
    } else if (function_defintion_end !== -1) {
      if (token.type === TKNS.Semicolon.type) {
        // function signature will start with a semicolon
        return [node, function_defintion_end];
      } else if (token.type === TKNS.CurlyBracketStart.type) {
        // function body will start with a curly bracket
        return [node, function_defintion_end];
      } else if (token.type === TKNS.NewLine.type) {
        // allow whitespace or newlines between closing paren and this point
      } else {
        identifier_paren = -1;
        function_defintion_end = -1;
      }
    } else if (identifier_paren !== -1) {
      if (token.type === TKNS.ParenStart.type) {
        paren_count += 1;
      } else if (token.type === TKNS.ParenEnd.type) {
        paren_count -= 1;
      } else if (token.type === TKNS.NewLine.type) {
        // allow new lines between
      }

      if (paren_count === 0) {
        function_defintion_end = i;
      }

      node.params.push(token);
    }
  }
}

function assignment_statement(statement) {
  for (const token of statement) {
    // assignment must occur before other characters,
    // such as opening parenthesis (e.g. function definitions)
    switch (token.type) {
      case TKNS.Assignment.type:
        return true;
      case TKNS.ParenStart.type:
        return false;
      default:
      // keep going
    }
  }
}
