#!/usr/bin/env node
import Version from 'src/Version';
import { pbcopy } from 'scripts/pbcopy';

import { Unrand } from './get_unrands';

const [, , ...VERSION_LIST] = process.argv;

if (!VERSION_LIST.length) {
  throw new Error(['Must specify VERSION list', '  Example', '  > build_unrand_list 0.27 0.28 0.29', ''].join('\n'));
}

function get_name_key(unrand: Unrand) {
  return unrand.name.toLowerCase();
}

const unrand_map = new Map();

for (const version of VERSION_LIST) {
  const unrand_list = Version.get_metadata(version).UnrandList;

  for (const unrand_base of unrand_list) {
    // add version for tracking which version introduced this unrand
    const unrand = Object.assign({}, unrand_base, { version });

    const unrand_name_key = get_name_key(unrand);
    const duplicate = unrand_map.get(unrand_name_key);

    // add to map if it doesn't already exist
    if (!duplicate) {
      unrand_map.set(unrand_name_key, unrand);
    } else if (unrand.name !== duplicate.name) {
      // name changed case but not actual characters, update to new name
      const name = unrand.name;
      Object.assign(duplicate, { name });
    }
  }
}

console.debug('unique unrands', unrand_map.size);

const sorted_unrand_list = Array.from(unrand_map.entries()).sort(([, a], [, b]) => {
  return get_name_key(a).localeCompare(get_name_key(b));
});

const unrand_id_map = new Map();

for (const [, unrand] of Array.from(unrand_map.entries())) {
  const duplicate = unrand_id_map.get(unrand.id);
  if (duplicate) {
    // assign the older duplicate unrand a more unique id
    // create unique id when unrand.id collides (due to name changes)
    // this will give us a unique id to track older version of the unrand by
    const id = [duplicate.id, Version.get_version_key(duplicate.version)].join('_');
    Object.assign(duplicate, { id });

    console.debug('DUPLICATE', { duplicate, unrand });
  } else {
    unrand_id_map.set(unrand.id, unrand);
  }
}

const output_lines = ['', `// Generated from \`scripts/build_unrand_list ${VERSION_LIST.join(' ')}\``, ''];
output_lines.push('export const List = [');
for (const [, unrand] of sorted_unrand_list) {
  output_lines.push(`  ${JSON.stringify(unrand.name)},`);
}
output_lines.push('];');
output_lines.push('');
output_lines.push('export const Metadata = [');
for (const [, unrand] of sorted_unrand_list) {
  output_lines.push(`  ${JSON.stringify(unrand)},`);
}
output_lines.push('];');

pbcopy(output_lines.join('\n'));
console.info('📋 Copied `Unrands.js` exports to clipboard.');
