#!/usr/bin/env node
import { expect, test } from 'bun:test';

const fs_promises = require('fs').promises;
const path = require('path');

const { CPPCompiler } = require('../CPPCompiler');

test('parses mon-data.h without errors', async () => {
  const mon_data_h = await readFile(path.join(__dirname, '..', '__fixtures__', 'mon-data.h'));

  const parsed = new CPPCompiler(mon_data_h);

  expect(parsed.ast.body.length).toBe(1);
  expect(parsed.tokens.length).toBe(65895);
});

async function readFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return source;
}
