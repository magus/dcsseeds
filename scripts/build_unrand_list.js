#!/usr/bin/env node
const Version = require('../src/Version');

const [, , ...VERSION_LIST] = process.argv;

if (!VERSION_LIST.length) {
  throw new Error(['Must specify VERSION list', '  Example', '  > build_unrand_list 0.27 0.28 0.29', ''].join('\n'));
}

const unrand_set = new Set();

for (const version of VERSION_LIST) {
  const unrand_list = Version.get_metadata(version).UnrandList;
  for (const unrand of unrand_list) {
    unrand_set.add(unrand);
  }
}

console.debug('unique unrands', unrand_set.size);

const sorted_unrand_list = Array.from(unrand_set).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

console.debug();
for (const unrand of sorted_unrand_list) {
  console.debug(`  ${JSON.stringify(unrand)},`);
}
