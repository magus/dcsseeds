const keyMirror = require('./keyMirror');

const Species = keyMirror({
  At: true,
  Ba: true,
  Ce: true,
  DD: true,
  DE: true,
  Dg: true,
  Dj: true,
  Ds: true,
  Dr: true,
  Fe: true,
  Fo: true,
  Gr: true,
  Gh: true,
  Gn: true,
  Ha: true,
  HO: true,
  Hu: true,
  Ko: true,
  Mf: true,
  Me: true,
  Mi: true,
  Mu: true,
  Na: true,
  Op: true,
  Og: true,
  Pa: true,
  Sp: true,
  Te: true,
  Tr: true,
  Vp: true,
  VS: true,
});

const Names = {
  [Species.At]: 'Armataur',
  [Species.Ba]: 'Barachi',
  [Species.Ce]: 'Centaur',
  [Species.DD]: 'Deep Dwarf',
  [Species.DE]: 'Deep Elf',
  [Species.Dg]: 'Demigod',
  [Species.Ds]: 'Demonspawn',
  [Species.Dj]: 'Djinni',
  [Species.Dr]: 'Draconian',
  [Species.Fe]: 'Felid',
  [Species.Fo]: 'Formicid',
  [Species.Gr]: 'Gargoyle',
  [Species.Gh]: 'Ghoul',
  [Species.Gn]: 'Gnoll',
  [Species.Ha]: 'Halfling',
  [Species.HO]: 'Hill Orc',
  [Species.Hu]: 'Human',
  [Species.Ko]: 'Kobold',
  [Species.Mf]: 'Merfolk',
  [Species.Me]: 'Meteoran',
  [Species.Mi]: 'Minotaur',
  [Species.Mu]: 'Mummy',
  [Species.Na]: 'Naga',
  [Species.Op]: 'Octopode',
  [Species.Og]: 'Ogre',
  [Species.Pa]: 'Palentonga',
  [Species.Sp]: 'Spriggan',
  [Species.Te]: 'Tengu',
  [Species.Tr]: 'Troll',
  [Species.Vp]: 'Vampire',
  [Species.VS]: 'Vine Stalker',
};

for (const pair of Object.entries(Names)) {
  const [key, value] = pair;

  if (key === 'undefined') {
    throw new Error(`Invalid entry in Names [${JSON.stringify({ key, value })}]`);
  }
}

module.exports = {
  ...Species,
  Keys: Species,
  Names,
  Regex: new RegExp(`(${Object.values(Names).join('|')})`),
};
