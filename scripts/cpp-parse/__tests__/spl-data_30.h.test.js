#!/usr/bin/env node
import { expect, test } from 'bun:test';

const fs_promises = require('fs').promises;
const path = require('path');

const { CPPCompiler } = require('../CPPCompiler');

test('parses spl-data.h without errors', async () => {
  const spl_data_h = await readFile(path.join(__dirname, '..', '__fixtures__', 'spl-data_30.h'));

  const parsed = new CPPCompiler(spl_data_h);

  expect(parsed.ast.body.length).toBe(1);
  expect(parsed.tokens.length).toBe(12535);
});

async function readFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return source;
}
