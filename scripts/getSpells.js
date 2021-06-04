#!/usr/bin/env node

const fs = require('fs').promises;
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');

// cd projRoot/crawl
// git checkout <version>

(async function run() {
  // await getSpellUtils();

  // grab spellbook data from crawl/crawl-ref/source/book-data.h
  const spellIds = await getPlayerAvailableSpells();
  console.debug('spellIds', spellIds.length);

  // grab spell data from crawl/crawl-ref/source/spl-data.h
  const spellData = await getSpellData();
  console.debug('spellData', Object.keys(spellData).length);

  // grab gui icon maps from crawl/crawl-ref/source/rltiles/dc-spells.txt
  const spellTileMap = await getSpellTileMap();
  // console.debug({ spellTileMap });

  // build list of all spells currently available in spellbooks (available to players in the game)
  // if a spell is not available in spellbooks template we can exclude it for this consideration
  const spells = {};
  spellIds.sort().forEach((id) => {
    spells[id] = {
      ...spellData[id],
      tilePath: spellTileMap.get(id),
    };
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

async function getPlayerAvailableSpells() {
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

  return Array.from(spellIdsSet);
}

async function getSpellData() {
  // See `struct spell_desc` in crawl/crawl-ref/source/spl-util.cc

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

  const spellData = {};

  const crawlSpellData = await parseFile('./crawl/crawl-ref/source/spl-data.h');
  crawlSpellData.traverse({
    Assignment: {
      enter(node, parent) {
        let isSpellDataArray = node.name.value === 'spelldata[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isSpellDataArray && isObject) {
          // each field of this array is a a `spell_desc` struct
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

  return spellData;
}

async function getSpellUtils() {
  // TODO requires updates to lexer and parser to handle more tokens
  debugger;
  const spellUtils = await parseFile('./crawl/crawl-ref/source/spl-util.cc');
  console.debug({ spellUtils });
}

async function getSpellTileMap() {
  const TILE_DIR = './crawl/crawl-ref/source/rltiles';
  const DIR_RE = /^%sdir (.*)$/;

  const tileMap = new Map();
  let dir = null;
  const spellTiles = await readFile(`${TILE_DIR}/dc-spells.txt`);
  spellTiles.split('\n').forEach((line) => {
    // handle directory lines
    // directory lines specify we are starting a new icon tile mapping
    // e.g. %sdir gui/spells/conjuration
    const dirMatch = line.match(DIR_RE);
    if (dirMatch) {
      [, dir] = dirMatch;
    } else {
      // handle tile mapping lines
      // tile mapping lines specify the icon filename and the spell id (enum)
      // e.g. orb_of_destruction IOOD
      if (line) {
        const [filename, id] = line.split(' ');
        const spellId = `SPELL_${id}`;
        const tilePath = `${TILE_DIR}/${dir}/${filename}.png`;
        tileMap.set(spellId, tilePath);
        // console.debug({ spellId, tilePath });
      }
    }
  });

  return tileMap;
}

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
