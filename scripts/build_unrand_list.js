#!/usr/bin/env node
const Version = require('../src/Version');
const { pbcopy } = require('./pbcopy');

const [, , ...VERSION_LIST] = process.argv;

if (!VERSION_LIST.length) {
  throw new Error(['Must specify VERSION list', '  Example', '  > build_unrand_list 0.27 0.28 0.29', ''].join('\n'));
}

const unrand_map = new Map();

for (const version of VERSION_LIST) {
  const unrand_list = Version.get_metadata(version).UnrandList;
  for (const unrand of unrand_list) {
    unrand_map.set(unrand.id, unrand);
  }
}

console.debug('unique unrands', unrand_map.size);

const sorted_unrand_list = Array.from(unrand_map.entries()).sort(([, a], [, b]) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
);

const output_lines = ['', `// Generated from \`scripts/build_unrand_list ${VERSION_LIST.join(' ')}\``, ''];
output_lines.push('export const List = [');
for (const [, unrand] of sorted_unrand_list) {
  output_lines.push(`  ${JSON.stringify(unrand.name)},`);
}
output_lines.push('];');
output_lines.push('');
output_lines.push('// prettier-ignore');
output_lines.push('export const Metadata = [');
for (const [, unrand] of sorted_unrand_list) {
  output_lines.push(`  ${JSON.stringify(unrand)},`);
}
output_lines.push('];');

pbcopy(output_lines.join('\n'));
console.info('📋 Copied `Unrands.js` exports to clipboard.');
