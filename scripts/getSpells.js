#!/usr/bin/env node

const fs = require('fs').promises;
const { cpp } = require('./cpp-parse/cpp');

// cd projRoot/crawl
// git checkout <version>
// grab spellbook data from crawl-ref/source/book-data.h
// grab spell data from crawl-ref/source/spl-data.h
// build list of all spells currently available in spellbooks
// if a spell is not available in spellbook we can consider it not in the game

(async function run() {
  await parseFile('./crawl/crawl-ref/source/book-data.h');
  await parseFile('./crawl/crawl-ref/source/spl-data.h');
})();

async function parseFile(filename) {
  let source = await readFile(filename);
  let cppDebug = cpp(source);
  console.info(cppDebug.ast);
}

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
