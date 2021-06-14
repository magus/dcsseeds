// Programmatically pulled from crawl/crawl-ref/source/mon-data.h
// M_UNIQUE flag indicates uniques, see scripts/getMonster.js

const UniquesNames = [
  'Agnes',
  'Aizul',
  'Antaeus',
  'Arachne',
  'Asmodeus',
  'Asterion',
  'Azrael',
  'Bai Suzhen',
  'Blork the orc',
  'Boris',
  'Cerebov',
  'Chuck',
  'Crazy Yiuf',
  'Dispater',
  'Dissolution',
  'Donald',
  'Dowan',
  'Duvessa',
  'Edmund',
  'Ereshkigal',
  'Erica',
  'Erolcha',
  'Eustachio',
  'Fannar',
  'Frances',
  'Frederick',
  'Gastronok',
  'Geryon',
  'Gloorx Vloq',
  'Grinder',
  'Grum',
  'Harold',
  'Ignacio',
  'Ijyb',
  'Ilsuiw',
  'Jessica',
  'Jorgrun',
  'Jory',
  'Joseph',
  'Josephine',
  'Khufu',
  'Kirke',
  'Lom Lobon',
  'Louise',
  'Maggie',
  'Mara',
  'Margery',
  'Maurice',
  'Menkaure',
  'Mennas',
  'Mnoleg',
  'Murray',
  'Natasha',
  'Nellie',
  'Nergalle',
  'Nessos',
  'Nikola',
  'Pikel',
  'Polyphemus',
  'Prince Ribbit',
  'Psyche',
  'Purgy',
  'Robin',
  'Roxanne',
  'Rupert',
  'Saint Roka',
  'Sigmund',
  'Snorg',
  'Sojobo',
  'Sonja',
  'Terence',
  'Tiamat',
  'Urug',
  'Vashnia',
  'Xtahua',
  'the Enchantress',
  'the Lernaean hydra',
  'the Royal Jelly',
  'the Serpent of Hell',
];

const UniquesLookup = {};

UniquesNames.forEach((name) => {
  UniquesLookup[name] = name;
});

module.exports = {
  Lookup: UniquesLookup,
};
