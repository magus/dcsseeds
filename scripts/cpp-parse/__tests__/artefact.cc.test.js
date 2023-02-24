#!/usr/bin/env node
const fs_promises = require('fs').promises;
const path = require('path');

const { CPPCompiler } = require('../CPPCompiler');

test('parses artefact.cc without errors', async () => {
  const parsed = await parseFile(path.join(__dirname, '..', '__fixtures__', 'artefact.cc'));
  expect(parsed.ast.body.length).toBe(78);
  expect(parsed.tokens.length).toBe(13424);
});

async function parseFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return new CPPCompiler(source);
}
