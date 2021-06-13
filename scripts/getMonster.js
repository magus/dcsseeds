#!/usr/bin/env node

const fs = require('fs').promises;
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');

const VERSION = '0.26.1';

// cd projRoot/crawl
// git checkout <version>

(async function run() {
  const monData = await getMonData();
  console.debug({ monData });
})();

async function getMonData() {
  // TODO requires updates to lexer and parser to handle more tokens
  const monData = await parseFile('./crawl/crawl-ref/source/mon-data.h');
  return monData;
}

async function parseFile(filename) {
  let source = await readFile(filename);
  return new CPPCompiler(source);
}

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
