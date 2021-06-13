#!/usr/bin/env node

const fs = require('fs').promises;
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');

const VERSION = '0.26.1';
const GITHUB_RAW = `https://raw.githubusercontent.com/crawl/crawl/${VERSION}`;

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
    let spell = spellData[id];

    let tilePath = spellTileMap.get(spell.tileId);

    spell = spells[id] = {
      ...spell,
      localTilePath: `./crawl/${tilePath}`,
      githubTilePath: `${GITHUB_RAW}/${tilePath}`,
    };

    if (!spell.localTilePath) {
      console.error({ spell });
      throw new Error(`[${spell.id}] missing localTilePath`);
    }

    console.debug(spell);
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
              const [identifier] = objVal.params;
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
  'tileId',
];

async function getSpellData() {
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
              const spellDescFieldValues = spell_desc_field.params;
              if (spellDescFieldValues.length === 1) {
                const [node] = spellDescFieldValues;
                spell[SPELL_DESC_FIELD[i]] = node.value;
              } else {
                spell[SPELL_DESC_FIELD[i]] = spellDescFieldValues
                  .filter((n) => n.type !== CPPCompiler.TKNS.BitwiseOr.type)
                  .map((node) => node.value);
              }
            });

            // ensure schools and flags are always arrays
            ensureArrayField(spell, 'schools');
            ensureArrayField(spell, 'flags');

            // parse spell schools
            spell.schools = spell.schools.map((school) => SPSCHOOL[school].name);

            // correct tile id
            spell.tileId = re(spell.tileId, RE.tileId);

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
  const TILE_DIR = 'crawl-ref/source/rltiles';
  const tileMap = new Map();
  let currentDir = null;
  const spellTiles = await readFile(`./crawl/${TILE_DIR}/dc-spells.txt`);
  spellTiles.split('\n').forEach((line) => {
    // handle directory lines
    // directory lines specify we are starting a new icon tile mapping
    // e.g. %sdir gui/spells/conjuration
    let lineDir = re(line, RE.tileDir);
    if (lineDir) {
      currentDir = lineDir;
    } else {
      // handle tile mapping lines
      // tile mapping lines specify the icon filename and the spell tile id
      // e.g. orb_of_destruction IOOD
      if (line) {
        const [filename, tileId] = line.split(' ');
        const tilePath = `${TILE_DIR}/${currentDir}/${filename}.png`;
        tileMap.set(tileId, tilePath);
        // console.debug({ tileId, tilePath });
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

function re(string, regex) {
  const match = string.match(regex);
  if (match) {
    let [, firstGroup] = match;
    return firstGroup;
  }
  return null;
}

const RE = {
  tileId: /^TILEG_(.*)$/,
  spellId: /^SPELL_(.*)$/,
  tileDir: /^%sdir (.*)$/,
};

// enum class spschool
// See crawl/crawl-ref/source/spl-util.cc
const SPSCHOOL = Object.freeze(
  [
    { name: 'Conjuration', id: 'conjuration' },
    { name: 'Hexes', id: 'hexes' },
    { name: 'Fire', id: 'fire' },
    { name: 'Ice', id: 'ice' },
    { name: 'Transmutation', id: 'transmutation' },
    { name: 'Necromancy', id: 'necromancy' },
    { name: 'Summoning', id: 'summoning' },
    { name: 'Translocation', id: 'translocation' },
    { name: 'Poison', id: 'poison' },
    { name: 'Earth', id: 'earth' },
    { name: 'Air', id: 'air' },
    { name: 'Random', id: 'random' },
    { name: 'None', id: 'none' },
  ].reduce((spschools, data) => {
    const { name, id } = data;
    const codeEnum = `spschool::${id}`;
    spschools[codeEnum] = { id, name, codeEnum };
    return spschools;
  }, {}),
);

function ensureArrayField(object, field) {
  if (!Array.isArray(object[field])) {
    object[field] = [object[field]];
  }
}
