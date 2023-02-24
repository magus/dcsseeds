#!/usr/bin/env node
const fs_promises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');
const { execSync } = require('child_process');

(async function run() {
  const parsed = await parseFile(path.join(__dirname, 'cpp-parse', '__fixtures__', 'artefact.cc'));

  console.dir(parsed, { depth: null });
  debugger;
})();

async function parseFile(filename) {
  let buffer = await fs_promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  let source = buffer.toString();
  return new CPPCompiler(source);
}
