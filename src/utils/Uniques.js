// Some things we consider uniques aren't really uniques
// i.e. Lernaean hydra, Royal Jelly, Serpent of Hell
// first pulled from https://github.com/crawl/crawl/blob/0.26.1/crawl-ref/source/dat/database/montitle.txt
// but this might not be the best source

// TODO: Programmatically pull from this file
// https://github.com/crawl/crawl/blob/0.26.1/crawl-ref/source/mon-data.h
// M_UNIQUE flag indicates uniques

const UniquesNames = [
  'Agnes',
  'Aizul',
  'Antaeus',
  'Arachne',
  'Asmodeus',
  'Asterion',
  'Azrael',
  'Bai Suzhen',
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
  'Grum',
  'Harold',
  'Ignacio',
  'Ilsuiw',
  'Ijyb',
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
];

const UniquesLookup = {};

UniquesNames.forEach((name) => {
  UniquesLookup[name] = name;
});

module.exports = {
  Lookup: UniquesLookup,
};
