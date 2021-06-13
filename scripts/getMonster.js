#!/usr/bin/env node

const fs = require('fs').promises;
const { CPPCompiler } = require('./cpp-parse/CPPCompiler');

const VERSION = '0.26.1';
const GITHUB_RAW = `https://raw.githubusercontent.com/crawl/crawl/${VERSION}`;

// cd projRoot/crawl
// git checkout <version>

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

const MONSTERENTRY = Object.freeze(
  MONSTERENTRY_FIELDNAMES.reduce((monsterentry, field) => {
    monsterentry[field] = field;
    return monsterentry;
  }, {}),
);

(async function run() {
  const monsters = await getMonsterData();
  const monTileMap = await getMonTileMap();

  const monstersWithTiles = [];
  monsters.forEach((monster) => {
    let tilePath = monTileMap.get(monster.tileId);

    const monsterWithTile = {
      ...monster,
      localTilePath: `./crawl/${tilePath}`,
      githubTilePath: `${GITHUB_RAW}/${tilePath}`,
    };

    if (!monsterWithTile.localTilePath) {
      console.error({ monster });
      throw new Error(`[${monster.id}] missing localTilePath`);
    }

    monstersWithTiles.push(monsterWithTile);
  });

  // monstersWithTiles.forEach((monster) => console.debug(JSON.stringify(monster, null, 2)));
  console.debug({ monstersWithTiles });
})();

async function getMonsterData() {
  const monsters = [];

  const monData = await parseFile('./crawl/crawl-ref/source/mon-data.h');
  monData.traverse({
    Assignment: {
      enter(node, parent) {
        let isTemplatesArray = node.name.value === 'mondata[]';
        let isObject = node.value.type === CPPCompiler.AST.Object.type;
        if (isTemplatesArray && isObject) {
          // each field of this array is a `monsterentry` struct
          node.value.fields.forEach((monsterentry, i) => {
            const entry = {};
            monsters.push(entry);

            // parse each field of this `monsterentry` struct
            monsterentry.fields.forEach((monsterentryField, i) => {
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
                  console.debug({ entry });
                  console.debug(JSON.stringify({ entry }, null, 2));

                  throw new Error(
                    `Unexpected MONSTERENTRY field [${fieldName}] = [${JSON.stringify(monsterentryField, null, 2)}]`,
                  );
              }
            });

            //
            // fixup entry
            //

            // correct tile id
            entry.tileId = re(entry.tileId, RE.tileId);
          });
        }
      },
    },
  });

  return monsters;
}

const DEFAULT_ENERGY_USAGE = [10, 10, 10, 10, 10, 10, 10, 100];

function expression(type, token) {
  switch (type) {
    case 'flags':
      return token.params.filter((n) => n.type !== CPPCompiler.TKNS.BitwiseOr.type).map((node) => node.value);
    case 'identifier':
    case 'string':
    case 'number':
    case 'boolean':
      const [firstParam] = token.params;
      return firstParam.value;
    case 'attacks':
      return token.fields.map((attack) => {
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
        return token.fields.map((field) => expression('number', field));
      } else {
        throw new Error(`Unhandled energy usage [${JSON.stringify(token, null, 2)}]`);
      }

    case 'tile':
      const [tileToken] = token.fields;
      return expression('identifier', tileToken);
    default:
      throw new Error(`Unexpected expression type [${type}] = [${JSON.stringify(token, null, 2)}]`);
  }
}

async function getMonTileMap() {
  const TILE_DIR = 'crawl-ref/source/rltiles';
  const tileMap = new Map();
  let currentDir = null;
  const dcMonContent = await readFile(`./crawl/${TILE_DIR}/dc-mon.txt`);
  const dcMonContentLines = dcMonContent.split('\n');

  // first pass replace includes
  const includedLines = [];
  for (let i = 0; i < dcMonContentLines.length; i++) {
    const line = dcMonContentLines[i];
    const include = re(line, RE.include);
    if (include) {
      const includeContent = await readFile(`./crawl/${TILE_DIR}/${include}`);
      includedLines.push(...includeContent.split('\n'));
    } else {
      includedLines.push(line);
    }
  }

  includedLines.forEach((line) => {
    // handle directory lines
    // directory lines specify we are starting a new icon tile mapping
    // e.g. %sdir mon/nonliving
    let lineDir = re(line, RE.tileDir);
    let outline = re(line, RE.outline);
    let comment = re(line, RE.comment);
    if (comment) {
      // ignore # comment lines
    } else if (outline) {
      // ignore %rim outline lines
    } else if (lineDir) {
      currentDir = lineDir;
    } else {
      // handle tile mapping lines
      // tile mapping lines specify the icon filename and the tile id
      // e.g. tiamat_black MONS_TIAMAT
      if (line) {
        const [filename, tileId] = line.split(' ');
        const tilePath = `${TILE_DIR}/${currentDir}/${filename}.png`;
        tileMap.set(tileId, tilePath);
        console.debug({ tileId, tilePath });
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

function re(string, regex) {
  const match = string.match(regex);
  if (match) {
    let [, firstGroup] = match;
    return firstGroup;
  }
  return null;
}

const RE = {
  tileId: /^TILEP_(.*)$/,
  tileDir: /^%sdir (.*)$/,
  outline: /^%rim (.*)$/,
  comment: /^#(.*)$/,
  include: /^%include (.*)$/,
};
