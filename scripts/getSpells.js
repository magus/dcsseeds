#!/usr/bin/env node

const fs = require('fs').promises;
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');

// cd projRoot/crawl
// git checkout <version>
// grab spellbook data from crawl-ref/source/book-data.h
// grab spell data from crawl-ref/source/spl-data.h
// build list of all spells currently available in spellbooks
// if a spell is not available in spellbook we can consider it not in the game

(async function run() {
  const bookData = await parseFile('./crawl/crawl-ref/source/book-data.h');
  bookData.traverse({
    Assignment: {
      enter(node, parent) {
        if (node.name.value === 'spellbook_templates[]') {
          console.debug('Assignment', 'enter', node.name.value);
          debugger;
        }
      },
    },
  });

  await parseFile('./crawl/crawl-ref/source/spl-data.h');
})();

async function parseFile(filename) {
  let source = await readFile(filename);
  return new CPPCompiler(source);
}

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}
