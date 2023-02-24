const { execSync } = require('child_process');

const { read_file } = require('./read_file');

const PROJ_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const LOCAL_TILE_DIR = `${PROJ_ROOT}/crawl`;
const TILE_DIR = `crawl-ref/source/rltiles`;

exports.get_tile_map = async function get_tile_map(file_list) {
  const content_lines = [];

  for (const file of file_list) {
    const fileContent = await read_file(`${LOCAL_TILE_DIR}/${TILE_DIR}/${file}`);
    content_lines.push(...fileContent.split('\n'));
  }

  const tileMap = new Map();
  let currentDir = null;
  let currentTileId = null;

  // first pass replace includes
  const include_lines = [];
  for (const line of content_lines) {
    const include = re(line, RE.include);

    if (include) {
      const content = await read_file(`${LOCAL_TILE_DIR}/${TILE_DIR}/${include}`);
      include_lines.push(...content.split('\n'));
    } else {
      include_lines.push(line);
    }
  }

  for (const line of include_lines) {
    // handle directory lines
    // directory lines specify we are starting a new icon tile mapping
    // e.g. %sdir mon/nonliving
    let lineDir = re(line, RE.tileDir);
    let outline = re(line, RE.outline);
    let back = re(line, RE.back);
    let backDir = re(line, RE.backDir);
    let endCat = re(line, RE.endCat);
    let corpse = re(line, RE.corpse);
    let comment = re(line, RE.comment);

    if (comment || outline || back || backDir || endCat || corpse) {
      // ignore these lines
    } else if (lineDir) {
      currentDir = lineDir;
    } else {
      // handle tile mapping lines
      // tile mapping lines specify the icon filename and the tile id
      // e.g. tiamat_black MONS_TIAMAT
      if (line) {
        let [filename, tileId] = line.split(' ');

        // handle path filenames and filename only
        let tilePath;
        if (re(filename, RE.isPath)) {
          // e.g. mon/unique/grinder MONS_GRINDER
          tilePath = `${TILE_DIR}/${filename}.png`;
        } else {
          // e.g. ufetubus MONS_UFETUBUS
          tilePath = `${TILE_DIR}/${currentDir}/${filename}.png`;
        }

        if (tileId) {
          // set currentTileId to the new tileId
          currentTileId = tileId;
          tileMap.set(currentTileId, [tilePath]);
        } else {
          // continue previous tileId (currentTileId)
          tileMap.set(currentTileId, [...tileMap.get(currentTileId), tilePath]);
        }

        // console.debug({
        //   currentTileId,
        //   tilePaths: tileMap.get(currentTileId),
        // });
      }
    }
  }

  return tileMap;
};

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
  comment: /^(#.*)$/,
  include: /^%include (.*)$/,
};

function re(string, regex) {
  const match = string.match(regex);
  if (match) {
    let [, firstGroup] = match;
    return firstGroup;
  }
  return null;
}
