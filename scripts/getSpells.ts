#!/usr/bin/env node

import { CPPCompiler } from 'scripts/cpp-parse/CPPCompiler';

import * as crawl_dir from './crawl_dir';
import { read_file } from './read_file';
import { get_tile_map } from './get_tile_map';

const VERSION = '0.27.1';

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
  const spellTileMap = await get_tile_map({ version: VERSION, file_list: ['dc-spells.txt'] });
  // console.debug({ spellTileMap });

  // build list of all spells currently available in spellbooks (available to players in the game)
  // if a spell is not available in spellbooks template we can exclude it for this consideration
  const spells: any = {};

  spellIds.sort().forEach((id) => {
    let spell = spellData[id];

    let tilePath = spellTileMap.get(spell.tileId);

    // console.debug({ tilePath });

    if (!tilePath) {
      throw new Error(`missing tilepath for [${spell.tileId}]`);
    }

    spell = spells[id] = {
      ...spell,
      localTilePath: tilePath,
      githubTilePath: tilePath.map((p) => crawl_dir.github(p)),
    };

    if (!spell.localTilePath) {
      console.error({ spell });
      throw new Error(`[${spell.id}] missing localTilePath`);
    }

    console.debug(spell);
  });

  console.debug('SPELL NAMES\n\n');
  const spellNames: Set<string> = new Set();
  Object.values(spells).forEach((spell: any) => {
    spellNames.add(spell.name);
  });
  const spellNamesAlpha = Array.from(spellNames).sort();
  spellNamesAlpha.forEach((spellName: string) => {
    console.debug(`"${capitalize(spellName)}",`);
  });
})();

async function getPlayerAvailableSpells() {
  const spellIdsSet: Set<string> = new Set();

  const crawlBookData = CPPCompiler(await read_file(crawl_dir.dir(VERSION, 'crawl-ref/source/book-data.h')));

  crawlBookData.traverse({
    Assignment: {
      enter(node: any) {
        let isTemplatesArray = node.name.value === 'spellbook_templates[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isTemplatesArray && isObject) {
          // each field of this array is a spellbook template object
          node.value.fields.forEach((template: any) => {
            // each field of this spellbook template object is a spell name
            template.fields.forEach((objVal: any) => {
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
  const spellData: any = {};

  const crawlSpellData = CPPCompiler(await read_file(crawl_dir.dir(VERSION, 'crawl-ref/source/spl-data.h')));

  crawlSpellData.traverse({
    Assignment: {
      enter(node: any) {
        let isSpellDataArray = node.name.value === 'spelldata[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isSpellDataArray && isObject) {
          // each field of this array is a a `spell_desc` struct
          node.value.fields.forEach((spell_desc: any) => {
            // create spell
            const spell: any = {};

            spell_desc.fields.forEach((spell_desc_field: any, i: number) => {
              const spellDescFieldValues = spell_desc_field.params;
              if (spellDescFieldValues.length === 1) {
                const [node] = spellDescFieldValues;
                spell[SPELL_DESC_FIELD[i]] = node.value;
              } else {
                spell[SPELL_DESC_FIELD[i]] = spellDescFieldValues
                  .filter((n: any) => n.type !== CPPCompiler.TKNS.BitwiseOr.type)
                  .map((node: any) => node.value);
              }
            });

            // ensure schools and flags are always arrays
            ensureArrayField(spell, 'schools');
            ensureArrayField(spell, 'flags');

            // parse spell schools
            spell.schools = spell.schools.map((school: any) => SPSCHOOL[school].name);

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

function capitalize(input: string) {
  const firstChar = input.charAt(0);
  return firstChar.toUpperCase() + input.toLowerCase().substring(1, input.length);
}

function re(input: string, regex: RegExp) {
  const match = input.match(regex);
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
const SPSCHOOL: any = Object.freeze(
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
  ].reduce((spschools: any, data) => {
    const { name, id } = data;
    const codeEnum = `spschool::${id}`;
    spschools[codeEnum] = { id, name, codeEnum };
    return spschools;
  }, {}),
);

function ensureArrayField(object: any, field: string) {
  if (!Array.isArray(object[field])) {
    object[field] = [object[field]];
  }
}
