#!/usr/bin/env node
import Version from 'src/Version';
import { pbcopy } from 'scripts/pbcopy';
import { Unrand as BaseUnrand } from 'scripts/get_unrands';
import { VERSIONS } from 'scripts/versions';

type Unrand = BaseUnrand & { version: string; i: number };

// 🚨 IMPORTANT
// This is intentionally using name to catch duplicates across versions
// e.g. sling "Punk" (0.27) vs greatsling "Punk" (0.29.1)
function get_name_key(unrand: BaseUnrand) {
  return unrand.name.toLowerCase();
}

const unrand_map: Map<string, Unrand> = new Map();

for (const version of VERSIONS) {
  const unrand_list = Version.get_metadata(version).UnrandList;

  for (const unrand_base of unrand_list) {
    // add version for tracking which version introduced this unrand
    const unrand = { ...unrand_base, version, i: -1 };

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

const output_lines = [
  // force line break
  '// Generated from `pnpm tsx scripts/Unrands`',
  '',
  '//prettier-ignore',
  'export const ById = {',
];

// sort by name and assign i for alphabetical ordering
let unrand_list: Array<Unrand> = Array.from(unrand_map.values());
unrand_list = unrand_list.sort((a, b) => get_name_key(a).localeCompare(get_name_key(b)));
for (let i = 0; i < unrand_list.length; i++) {
  const unrand = unrand_list[i];
  const entry = { ...unrand, i };
  unrand_list[i] = entry;
}

const by_version: { [version: string]: Array<Unrand> } = {};
for (const unrand of unrand_list) {
  if (!by_version[unrand.version]) {
    by_version[unrand.version] = [];
  }
  by_version[unrand.version].push(unrand);
}

for (const version of Object.keys(by_version).sort(Version.compare)) {
  output_lines.push(`  // ${version}`);

  let unrand_list = by_version[version];
  unrand_list = unrand_list.sort((a, b) => get_name_key(a).localeCompare(get_name_key(b)));
  for (const unrand of unrand_list) {
    output_lines.push(`  '${unrand.id}': ${JSON.stringify(unrand)},`);
  }
}

output_lines.push(
  '};',
  '',
  'export const List = [];',
  'export const Metadata = [];',
  'export const NameIndex = {};',
  '',
  'for (const unrand of Object.values(ById).sort((a, b) => a.i - b.i)) {',
  '  List.push(unrand.name);',
  '  Metadata.push(unrand);',
  '  NameIndex[unrand.name] = unrand.i;',
  '}',
);

pbcopy(output_lines.join('\n'));
console.info('📋 Copied `Unrands.js` exports to clipboard.');
