// Branch name data
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/branch-data.h

import keyMirror from 'src/utils/keyMirror';
import { runRegex } from 'src/utils/runRegex';

const Branch = keyMirror({
  Abyss: true,
  Arena: true,
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
  // https://github.com/crawl/crawl/commit/72caabbf62b69e8ace7d022fee61988b55e88f2c#diff-d4fa5f64a5ed79cb0cf82d041f932e5eecc454bf4acedd93e9547dad13e72e5c
  Necropolis: true,
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

  // 0.32 Makhleb post-transformation zone
  // https://crawl.akrasiac.org/rawdata/kohrah/morgue-kohrah-20241008-203123.txt
  CrucibleFlesh: true,
});

const BRANCH_ALIASES = {
  abyss: Branch.Abyss,
  arena: Branch.Arena,
  "okawaru's arena": Branch.Arena,
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
  'necropolis': Branch.Necropolis,
  'the necropolis': Branch.Necropolis,
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
  crucible: Branch.CrucibleFlesh,
  'crucible of flesh': Branch.CrucibleFlesh,
  'the crucible of flesh': Branch.CrucibleFlesh,
};

// add 8 character max alias, e.g. Necropolis → Necropol
// https://crawl.akrasiac.org/rawdata/Adeiron/morgue-Adeiron-20250815-125830.txt
for (const branchName of Object.values(Branch)) {
  const shortName = branchName.slice(0, 8).toLowerCase();
  if (!BRANCH_ALIASES[shortName]) {
    BRANCH_ALIASES[shortName] = branchName;
  }
}
const BRANCH_NAME_ALIAS_REGEX = new RegExp(`(${Object.keys(BRANCH_ALIASES).join('|')})`, 'i');

const normalizeBranchName = (branch) => BRANCH_ALIASES[branch.toLowerCase()] || branch;

function getBranch(branch) {
  // parse and extract branch name using aliases
  const [, parsedBranch] = runRegex('getBranch', branch, BRANCH_NAME_ALIAS_REGEX);

  // normalize branch name
  return normalizeBranchName(parsedBranch);
}

// backwards compatability with old module.exports
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  ...Branch,
  Lookup: BRANCH_ALIASES,
  Regex: BRANCH_NAME_ALIAS_REGEX,
  getBranch,
};
