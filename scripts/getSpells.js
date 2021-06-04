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
  const spellIdsSet = new Set();
  const crawlBookData = await parseFile('./crawl/crawl-ref/source/book-data.h');
  crawlBookData.traverse({
    Assignment: {
      enter(node, parent) {
        let isTemplatesArray = node.name.value === 'spellbook_templates[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isTemplatesArray && isObject) {
          // each field of this array is a spellbook template object
          node.value.fields.forEach((template) => {
            // each field of this spellbook template object is a spell name
            template.fields.forEach((objVal) => {
              const [identifier] = objVal.values;
              // add spell name to spellbook set
              spellIdsSet.add(identifier.value);
            });
          });
        }
      },
    },
  });

  const spellIds = Array.from(spellIdsSet);
  console.debug('spellIds', spellIds.length);

  const spellData = {};
  const crawlSpellData = await parseFile('./crawl/crawl-ref/source/spl-data.h');
  crawlSpellData.traverse({
    Assignment: {
      enter(node, parent) {
        let isSpellDataArray = node.name.value === 'spelldata[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isSpellDataArray && isObject) {
          // each field of this array is a a `spell_desc` struct
          // struct spell_desc
          // {
          //   enum, spell name,
          //   spell schools,
          //   flags,
          //   level,
          //   power_cap,
          //   min_range, max_range, (-1 if not applicable)
          //   noise, effect_noise
          //   tile
          // }
          const SPELL_DESC_FIELD = [
            'id',
            'name',
            'schools',
            'flags',
            'level',
            'powerCap',
            'minRange',
            'maxRange',
            'noise',
            'effectNoise',
            'tile',
          ];
          node.value.fields.forEach((spell_desc) => {
            // create spell
            const spell = {};

            spell_desc.fields.forEach((spell_desc_field, i) => {
              const spellDescFieldValues = spell_desc_field.values;
              if (spellDescFieldValues.length === 1) {
                const [node] = spellDescFieldValues;
                spell[SPELL_DESC_FIELD[i]] = node.value;
              } else {
                spell[SPELL_DESC_FIELD[i]] = spellDescFieldValues
                  .filter((n) => n.type !== CPPCompiler.TKNS.BitwiseOr.type)
                  .map((node) => node.value);
              }
            });

            // add spell to spell data by id (enum)
            spellData[spell.id] = spell;
          });
        }
      },
    },
  });

  console.debug('spellData', Object.keys(spellData).length);

  // now use spell data and spellIds to build the spells available in the game
  const spells = {};
  spellIds.sort().forEach((id) => {
    spells[id] = spellData[id];
    console.debug(spells[id]);
  });

  console.debug('SPELL NAMES\n\n');
  const spellNames = new Set();
  Object.values(spells).forEach((spell) => {
    spellNames.add(spell.name);
  });
  const spellNamesAlpha = Array.from(spellNames).sort();
  spellNamesAlpha.forEach((spellName) => {
    console.debug(`"${capitalize(spellName)}",`);
  });
})();

async function parseFile(filename) {
  let source = await readFile(filename);
  return new CPPCompiler(source);
}

async function readFile(filename) {
  let buffer = await fs.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
}

function capitalize(string) {
  const [firstChar] = string;
  return firstChar.toUpperCase() + string.toLowerCase().substr(1, string.length);
}
