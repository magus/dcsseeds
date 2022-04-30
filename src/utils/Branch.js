// Branch name data
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/branch-data.h

const keyMirror = require('src/utils/keyMirror');
const runRegex = require('src/utils/runRegex');

const Branch = keyMirror({
  Abyss: true,
  Bailey: true,
  Bazaar: true,
  Blade: true,
  Cocytus: true,
  Crypt: true,
  Depths: true,
  Desolation: true,
  Dis: true,
  Dungeon: true,
  Dwarf: true,
  Elf: true,
  Forest: true,
  Gauntlet: true,
  Gehenna: true,
  Hell: true,
  IceCave: true,
  Labyrinth: true,
  Lair: true,
  Orc: true,
  Ossuary: true,
  Pandemonium: true,
  Slime: true,
  Zot: true,
  Sewer: true,
  Shoals: true,
  Snake: true,
  Spider: true,
  Swamp: true,
  Tartarus: true,
  Temple: true,
  Tomb: true,
  Trove: true,
  Vaults: true,
  Volcano: true,
  WizLab: true,
  Ziggurat: true,
});

const BRANCH_ALIASES = {
  abyss: Branch.Abyss,
  bailey: Branch.Bailey,
  bazaar: Branch.Bazaar,
  blade: Branch.Blade,
  'hall of blades': Branch.Blade,
  coc: Branch.Cocytus,
  cocytus: Branch.Cocytus,
  crypt: Branch.Crypt,
  depths: Branch.Depths,
  desolati: Branch.Desolation,
  desolation: Branch.Desolation,
  'desolation of salt': Branch.Desolation,
  dis: Branch.Dis,
  'iron city of dis': Branch.Dis,
  d: Branch.Dungeon,
  dungeon: Branch.Dungeon,
  dwarf: Branch.Dwarf,
  'dwarven hall': Branch.Dwarf,
  elf: Branch.Elf,
  'elven halls': Branch.Elf,
  forest: Branch.Forest,
  'enchanted forest': Branch.Forest,
  gauntlet: Branch.Gauntlet,
  geh: Branch.Gehenna,
  gehenna: Branch.Gehenna,
  'vestibule of hell': Branch.Hell,
  hell: Branch.Hell,
  icecv: Branch.IceCave,
  'ice cave': Branch.IceCave,
  lab: Branch.Labyrinth,
  labyrinth: Branch.Labyrinth,
  lair: Branch.Lair,
  'lair of beasts': Branch.Lair,
  orc: Branch.Orc,
  'orcish mines': Branch.Orc,
  ossuary: Branch.Ossuary,
  pan: Branch.Pandemonium,
  pandemonium: Branch.Pandemonium,
  'pits of slime': Branch.Slime,
  slime: Branch.Slime,
  'slime pits': Branch.Slime,
  'realm of zot': Branch.Zot,
  zot: Branch.Zot,
  sewer: Branch.Sewer,
  shoals: Branch.Shoals,
  snake: Branch.Snake,
  'snake pit': Branch.Snake,
  spider: Branch.Spider,
  'spider nest': Branch.Spider,
  swamp: Branch.Swamp,
  tar: Branch.Tartarus,
  temple: Branch.Temple,
  'ecumenical temple': Branch.Temple,
  tartarus: Branch.Tartarus,
  tomb: Branch.Tomb,
  'tomb of the ancients': Branch.Tomb,
  'treasure trove': Branch.Trove,
  trove: Branch.Trove,
  vaults: Branch.Vaults,
  volcano: Branch.Volcano,
  wizlab: Branch.WizLab,
  "wizard's laboratory": Branch.WizLab,
  zig: Branch.Ziggurat,
  ziggurat: Branch.Ziggurat,
};

const BRANCH_NAME_ALIAS_REGEX = new RegExp(`(${Object.keys(BRANCH_ALIASES).join('|')})`, 'i');

const normalizeBranchName = (branch) => BRANCH_ALIASES[branch.toLowerCase()] || branch;

function getBranch(branch) {
  // parse and extract branch name using aliases
  const [, parsedBranch] = runRegex('getBranch', branch, BRANCH_NAME_ALIAS_REGEX);

  // normalize branch name
  return normalizeBranchName(parsedBranch);
}

module.exports = {
  ...Branch,
  Lookup: BRANCH_ALIASES,
  Regex: BRANCH_NAME_ALIAS_REGEX,
  getBranch,
};
