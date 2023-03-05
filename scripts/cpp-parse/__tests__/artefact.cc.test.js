#!/usr/bin/env node
const fs_promises = require('fs').promises;
const path = require('path');

const { CPPCompiler } = require('../CPPCompiler');

test('parses artefact.cc without errors', async () => {
  const artefact_cc = await readFile(path.join(__dirname, '..', '__fixtures__', 'artefact.cc'));
  const art_data_h = await readFile(path.join(__dirname, '..', '__fixtures__', 'art-data.h'));

  const parsed = new CPPCompiler(artefact_cc, {
    include: {
      'art-data.h': art_data_h,
    },
  });

  expect(parsed.ast.body.length).toBe(75);
  expect(parsed.tokens.length).toBe(30530);
});

async function readFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return source;
}
