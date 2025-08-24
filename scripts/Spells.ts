#!/usr/bin/env node
import Version from 'src/Version';
import { pbcopy } from 'scripts/pbcopy';

function get_name_key(name: string) {
  return name.toLowerCase();
}

const spell_map = new Map();

for (const version_enum of Version.ActiveList) {
  const metadata = Version.get_metadata(version_enum);
  const version = metadata.Name;

  for (const name of metadata.SpellList) {
    // add version for tracking which version it was introduced
    const spell = { name, version };

    const key = get_name_key(spell.name);
    const duplicate = spell_map.get(key);

    // add to map if it doesn't already exist
    if (!duplicate) {
      spell_map.set(key, spell);
    } else if (spell.name !== duplicate.name) {
      // name changed case but not actual characters, update to new name
      console.error('new name', { spell, duplicate });
      process.exit(9999);
    }
  }
}

console.debug(spell_map);
console.debug('unique spells', spell_map.size);

const sorted_spell_list = Array.from(spell_map.entries()).sort(([a], [b]) => {
  return get_name_key(a).localeCompare(get_name_key(b));
});

const output_lines = [
  // force line break
  '// Generated from `pnpm tsx scripts/Spells`',
  '',
  'export const List = [',
];

for (const [, spell] of sorted_spell_list) {
  output_lines.push(`  ${JSON.stringify(spell.name)},`);
}

output_lines.push('];');

pbcopy(output_lines.join('\n'));
console.info('📋 Copied `Spells.js` exports to clipboard.');
