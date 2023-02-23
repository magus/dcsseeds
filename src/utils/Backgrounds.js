const keyMirror = require('./keyMirror');

const Backgrounds = keyMirror({
  AE: true,
  AK: true,
  AM: true,
  Ar: true,
  As: true,
  Be: true,
  Br: true,
  CA: true,
  Cj: true,
  CK: true,
  De: true,
  EE: true,
  En: true,
  FE: true,
  Gl: true,
  HW: true,
  Hu: true,
  IE: true,
  Mo: true,
  Ne: true,
  Sk: true,
  Su: true,
  Tm: true,
  VM: true,
  Wn: true,
  Wr: true,
  Wz: true,
  Fi: true,
});

// See GUI for background abbreviations and names
// https://github.com/crawl/crawl/blob/master/crawl-ref/source/rltiles/dc-gui.txt
const Names = {
  [Backgrounds.AE]: 'Air Elementalist',
  [Backgrounds.AK]: 'Abyssal Knight',
  [Backgrounds.AM]: 'Arcane Marksman',
  [Backgrounds.Ar]: 'Artificer',
  [Backgrounds.As]: 'Assassin',
  [Backgrounds.Be]: 'Berserker',
  [Backgrounds.Br]: 'Brigand',
  [Backgrounds.CA]: 'Cinder Acolyte',
  [Backgrounds.Cj]: 'Conjurer',
  [Backgrounds.CK]: 'Chaos Knight',
  [Backgrounds.De]: 'Delver',
  [Backgrounds.EE]: 'Earth Elementalist',
  [Backgrounds.En]: 'Enchanter',
  [Backgrounds.FE]: 'Fire Elementalist',
  [Backgrounds.Fi]: 'Fighter',
  [Backgrounds.Gl]: 'Gladiator',
  [Backgrounds.HW]: 'Hedge Wizard',
  [Backgrounds.Hu]: 'Hunter',
  [Backgrounds.IE]: 'Ice Elementalist',
  [Backgrounds.Mo]: 'Monk',
  [Backgrounds.Ne]: 'Necromancer',
  [Backgrounds.Sk]: 'Skald',
  [Backgrounds.Su]: 'Summoner',
  [Backgrounds.Tm]: 'Transmuter',
  [Backgrounds.VM]: 'Venom Mage',
  [Backgrounds.Wn]: 'Wanderer',
  [Backgrounds.Wr]: 'Warper',
  [Backgrounds.Wz]: 'Wizard',
};

for (const pair of Object.entries(Names)) {
  const [key, value] = pair;

  if (key === 'undefined') {
    throw new Error(`Invalid entry in Names [${JSON.stringify({ key, value })}]`);
  }
}

module.exports = {
  ...Backgrounds,
  Keys: Backgrounds,
  Names,
  Regex: new RegExp(`(${Object.values(Names).join('|')})`),
};
