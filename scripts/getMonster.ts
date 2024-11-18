#!/usr/bin/env node
import fs from 'fs';

import arrayToEnum from 'src/utils/arrayToEnum';
import { CPPCompiler } from 'scripts/cpp-parse/CPPCompiler';

import * as crawl_dir from './crawl_dir';
import { get_tile_map } from './get_tile_map';

const VERSION = '0.27.1';
// const VERSION = '0.26.1';

(async function run() {
  crawl_dir.prepare(VERSION);

  const monsters = await getMonstersWithTiles();

  // console.dir(monsters, { depth: null });

  monsters.forEach((monster) => {
    // console.dir(monster.id);

    console.dir(monster, { depth: null });

    // if (monster.name === 'ettin') {
    //   console.dir(monster, { depth: null });
    // }

    // if (monster.name === 'endoplasm') {
    //   console.dir(monster, { depth: null });
    // }

    // console.dir(
    //   [
    //     // fields to log from monster
    //     'id',
    //     'flags',
    //     'resists',
    //   ].reduce((logged, field) => {
    //     logged[field] = monster[field];
    //     return logged;
    //   }, {}),
    //   { depth: null },
    // );

    // if (monster.name === 'Grinder') {
    // if (monster.id === 'MONS_SIGMUND') {
    // if (monster.id === 'MONS_OCTOPODE') {
    // if (monster.id === 'MONS_GOLDEN_DRAGON') {
    // if (monster.id === 'DRACO_BASE') {
    // if (monster.id === 'MONS_UGLY_THING') {
    //   console.dir(monster, { depth: null });
    // }
  });

  console.debug('monsters', monsters.length);

  const uniques = monsters.filter((m) => !!~m.flags.indexOf('M_UNIQUE')).map((m) => m.name);
  const uniquesSorted = Array.from(new Set(uniques)).sort();
  console.dir(uniquesSorted);
  console.debug('uniques', uniquesSorted.length);

  crawl_dir.reset();
})();

async function getMonstersWithTiles() {
  const monsters = await getMonsterData();

  const monTileMap = await get_tile_map({
    version: VERSION,
    file_list: ['dc-mon.txt', 'dc-misc.txt', 'dc-player.txt'],
  });

  const monstersWithTiles = [];

  const flags = {
    DRACO_BASE_MODE: 0,
  };

  function monster_tilepaths(monster: any) {
    let tilePaths = monTileMap.get(monster.tileId);

    if (!tilePaths || tilePaths.length < 1) {
      console.dir(monster, { depth: null });
      throw new Error(`[${monster.id}] missing tilePaths`);
    }

    return tilePaths;
  }

  for (let monster_i = 0; monster_i < monsters.length; monster_i++) {
    const monster = monsters[monster_i];

    let tilePaths = monTileMap.get(monster.tileId);

    // handle DRACO_BASE special case (in order)
    if (flags.DRACO_BASE_MODE) {
      if (monster.tileId === 'DRACO_BASE') {
        tilePaths = [monster_tilepaths(monster)[flags.DRACO_BASE_MODE++]];
        // console.debug('DRACO_BASE_MODE', { tilePaths });
      } else {
        // console.debug('ending', 'DRACO_BASE_MODE');
        flags.DRACO_BASE_MODE = 0;
      }
    } else if (monster.tileId === 'DRACO_BASE') {
      // console.debug('starting', 'DRACO_BASE_MODE');
      tilePaths = [monster_tilepaths(monster)[flags.DRACO_BASE_MODE++]];
    } else if (monster.tileId === 'MONS_MERGED_SLIME_CREATURE') {
      // handle MONS_MERGED special case
      // See tileidx_monster_base in crawl/crawl-ref/source/tilepick.cc
      const slime_tiles = monTileMap.get('MONS_SLIME_CREATURE');
      if (!slime_tiles) {
        throw new Error('unable to get slime tiles');
      }
      tilePaths = slime_tiles.slice(1);
    } else if (monster.tileId === 'MONS_SNAPLASHER_VINE') {
      // handle tentacle special case
      // See crawl/crawl-ref/source/tilepick.cc
      tilePaths = monTileMap.get('MONS_VINE_S');
    } else if (monster.tileId === 'MONS_STARSPAWN_TENTACLE') {
      tilePaths = monTileMap.get('MONS_STARSPAWN_TENTACLE_S');
    } else if (monster.tileId === 'MONS_KRAKEN_TENTACLE') {
      tilePaths = monTileMap.get('MONS_KRAKEN_TENTACLE_WATER');
    } else if (monster.tileId === 'MONS_ELDRITCH_TENTACLE') {
      tilePaths = monTileMap.get('MONS_ELDRITCH_TENTACLE_PORTAL');
    } else if (monster.tileId === 'MONS_SNAPLASHER_VINE_SEGMENT') {
      // handle tentacle segments special case
      // See crawl/crawl-ref/source/tilepick.cc
      tilePaths = monTileMap.get('MONS_VINE_SEGMENT_N_S');
    } else if (monster.tileId === 'MONS_STARSPAWN_TENTACLE_SEGMENT') {
      tilePaths = monTileMap.get('MONS_STARSPAWN_TENTACLE_SEGMENT_N_S');
    } else if (monster.tileId === 'MONS_KRAKEN_TENTACLE_SEGMENT') {
      tilePaths = monTileMap.get('MONS_KRAKEN_TENTACLE_SEGMENT_N');
    } else if (monster.tileId === 'MONS_ELDRITCH_TENTACLE_SEGMENT') {
      tilePaths = monTileMap.get('MONS_ELDRITCH_TENTACLE_SEGMENT_N_S');
    } else if (monster.tileId === 'MONS_PLAYER_SHADOW') {
      // handle MONS_PLAYER_SHADOW special case
      tilePaths = monTileMap.get('SHADOW');
    }

    // ensure tilePaths are present
    if (!tilePaths || tilePaths.length < 1) {
      console.dir(monster, { depth: null });
      throw new Error(`[${monster.id}] missing tilePaths`);
    }

    const monsterWithTile = {
      ...monster,
      localTilePaths: tilePaths,
      githubTilePaths: tilePaths.map((tilePath: string) => crawl_dir.github(tilePath)),
    };

    // ensure local tile paths exist (we have a valid tile)
    for (let tile_i = 0; tile_i < monsterWithTile.localTilePaths.length; tile_i++) {
      const localTilePath = monsterWithTile.localTilePaths[tile_i];
      try {
        await fs.promises.stat(localTilePath);
      } catch (err) {
        console.error(err);
        throw new Error(`[${monster.id}] missing localTilePath [${localTilePath}]`);
      }
    }

    monstersWithTiles.push(monsterWithTile);
  }

  return monstersWithTiles;
}

async function getMonsterData() {
  const monsters: any = [];

  const flags = {
    // flag to toggle when we are walking over the DRACO_BASE tile monsters
    // draconians have an invalid tileId (TILEP_MONS_PROGRAM_BUG)
    // they instead match, in order exactly to the sprites under DRACO_BASE in dc-mon.txt
    DRACO_BASE_MODE: false,
  };

  const monData = await parseFile('crawl-ref/source/mon-data.h');
  monData.traverse({
    Assignment: {
      enter(node: any) {
        let isTemplatesArray = node.name.value === 'mondata[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isTemplatesArray && isObject) {
          // each field of this array is a `monsterentry` struct
          node.value.fields.forEach((monsterentry: any) => {
            const entry: any = {};

            // parse each field of this `monsterentry` struct
            monsterentry.fields.forEach((monsterentryField: any, i: number) => {
              const fieldName = MONSTERENTRY_FIELDNAMES[i];

              switch (fieldName) {
                case MONSTERENTRY.id:
                case MONSTERENTRY.glyph:
                case MONSTERENTRY.name:
                  return (entry[fieldName] = expression('string', monsterentryField));
                case MONSTERENTRY.color:
                case MONSTERENTRY.genus:
                case MONSTERENTRY.species:
                case MONSTERENTRY.holiness:
                case MONSTERENTRY.spells:
                case MONSTERENTRY.shouts:
                case MONSTERENTRY.intelligence:
                case MONSTERENTRY.habitat:
                case MONSTERENTRY.itemUseType:
                case MONSTERENTRY.size:
                case MONSTERENTRY.shape:
                case MONSTERENTRY.tileCorpseId:
                  return (entry[fieldName] = expression('identifier', monsterentryField));
                case MONSTERENTRY.flags:
                case MONSTERENTRY.resists:
                  return (entry[fieldName] = expression('flags', monsterentryField));
                case MONSTERENTRY.experienceModifier:
                case MONSTERENTRY.willpower:
                case MONSTERENTRY.hitDice:
                case MONSTERENTRY.hitPoints:
                case MONSTERENTRY.armorClass:
                case MONSTERENTRY.evasion:
                case MONSTERENTRY.speed:
                  return (entry[fieldName] = expression('number', monsterentryField));
                case MONSTERENTRY.attacks:
                  return (entry[fieldName] = expression('attacks', monsterentryField));
                case MONSTERENTRY.leavesCorpse:
                  return (entry[fieldName] = expression('boolean', monsterentryField));
                case MONSTERENTRY.energyUsage:
                  return (entry[fieldName] = expression('energyUsage', monsterentryField));
                case MONSTERENTRY.tileId:
                  return (entry[fieldName] = expression('tile', monsterentryField));

                default:
                  console.dir(entry, { depth: null });
                  throw new Error(
                    `Unexpected MONSTERENTRY field [${fieldName}] = [${JSON.stringify(monsterentryField, null, 2)}]`,
                  );
              }
            });

            // exclude incomplete DUMMY monsters
            if (entry.id === 'MONS_HELL_LORD') {
              return;
            }

            // include if we didn't exclude above
            monsters.push(entry);

            //
            // fixup entry
            //

            // correct tile id
            [RE.tileIdA, RE.tileIdB].some((regex) => {
              const tileId = re(entry.tileId, regex);
              if (tileId) {
                entry.tileId = tileId;
              }
            });

            // handle special case for orderd draconian sprites in dc-mon.txt
            if (flags.DRACO_BASE_MODE) {
              if (entry.tileId === 'MONS_PROGRAM_BUG') {
                entry.tileId = 'DRACO_BASE';
              } else {
                // console.debug('ending', 'DRACO_BASE_MODE');
                flags.DRACO_BASE_MODE = false;
              }
            } else if (entry.tileId === 'DRACO_BASE') {
              // console.debug('starting', 'DRACO_BASE_MODE');
              flags.DRACO_BASE_MODE = true;
            }

            // when tile id is invalid error default
            if (entry.tileId === 'MONS_PROGRAM_BUG') {
              // fallback to the id as the tile id
              entry.tileId = entry.id;
            }
          });
        }
      },
    },
  });

  return monsters;
}

// Energy usage has a predictable array structure
// See `struct mon_energy_usage` in crawl/crawl-ref/source/mon-util.h
const ENERGY_USAGE_FIELDS = ['move', 'swim', 'attack', 'missile', 'spell', 'special', 'item', 'pickupPercent'];
const DEFAULT_ENERGY_USAGE = buildEnergyUsage([10, 10, 10, 10, 10, 10, 10, 100]);

function buildEnergyUsage(energyUsageArray: Array<number>): any {
  const energyUsage: any = {};
  for (let i = 0; i < ENERGY_USAGE_FIELDS.length; i++) {
    const energyUsageField = ENERGY_USAGE_FIELDS[i];
    energyUsage[energyUsageField] = energyUsageArray[i];
  }
  return energyUsage;
}

function expression(type: string, token: any): any {
  switch (type) {
    case 'flags':
      return token.params.filter((n: any) => n.type !== CPPCompiler.TKNS.BitwiseOr.type).map((node: any) => node.value);
    case 'identifier':
    case 'string':
    case 'number':
    case 'boolean': {
      const [firstParam] = token.params;
      return firstParam.value;
    }

    case 'attacks':
      return token.fields.map((attack: any) => {
        const [typeToken, flavorToken, damageToken] = attack.fields;
        return {
          type: expression('identifier', typeToken),
          flavor: expression('identifier', flavorToken),
          damage: expression('number', damageToken),
        };
      });
    case 'energyUsage':
      if (token.type === CPPCompiler.AST.Expression.type && token.params.length === 1) {
        return DEFAULT_ENERGY_USAGE;
      } else if (token.type === CPPCompiler.AST.Object.type && token.fields.length === 8) {
        const energyUsageArray = token.fields.map((field: any) => expression('number', field));
        return buildEnergyUsage(energyUsageArray);
      } else {
        throw new Error(`Unhandled energy usage [${JSON.stringify(token, null, 2)}]`);
      }

    case 'tile': {
      const [tileToken] = token.fields;
      return expression('identifier', tileToken);
    }

    default:
      throw new Error(`Unexpected expression type [${type}] = [${JSON.stringify(token, null, 2)}]`);
  }
}

async function parseFile(filepath: string) {
  let source = await readFile(crawl_dir.dir(VERSION, filepath));
  return CPPCompiler(source);
}

async function readFile(filename: string) {
  let buffer = await fs.promises.readFile(filename, { encoding: 'utf8', flag: 'r' });
  return buffer.toString();
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
  isPath: /(\/)/,
  tileIdA: /^TILEP_(.*)$/,
  tileIdB: /^TILE_(.*)$/,
  tileCorpseId: /^TILE_CORPSE_(.*)$/,
  tileDir: /^%sdir (.*)$/,
  outline: /^%rim (.*)$/,
  corpse: /^%corpse (.*)$/,
  back: /^%back (.*)$/,
  backDir: /^%back_sdir (.*)$/,
  endCat: /^(%end_ctg)$/,
  comment: /^#(.*)$/,
  include: /^%include (.*)$/,
};

// `struct monsterentry` defines the fields of monster entries
// See crawl/crawl-ref/source/mon-util.h
// there are also some explanations in crawl/crawl-ref/source/mon-data.h as well
const MONSTERENTRY_FIELDNAMES = [
  'id',
  'glyph',
  'color',
  'name',
  'flags',
  'resists',
  'experienceModifier',
  'genus',
  'species',
  'holiness',
  'willpower',
  'attacks',
  'hitDice',
  'hitPoints',
  'armorClass',
  'evasion',
  'spells',
  'leavesCorpse',
  'shouts',
  'intelligence',
  'habitat',
  'speed',
  'energyUsage',
  'itemUseType',
  'size',
  'shape',
  'tileId',
  'tileCorpseId',
];

const MONSTERENTRY = arrayToEnum(MONSTERENTRY_FIELDNAMES);
