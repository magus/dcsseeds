const keyMirror = require('src/utils/keyMirror');

const Gods = keyMirror({
  Zin: true,
  Yredelemnul: true,
  Okawaru: true,
  Makhleb: true,
  SifMuna: true,
  Trog: true,
  Elyvilon: true,
  Lugonu: true,
  Beogh: true,
  Fedhas: true,
  Cheibriados: true,
  Ashenzari: true,
  Dithmenos: true,
  NemelexXobeh: true,
  Gozag: true,
  Qazlal: true,
  Ru: true,
  Pakellas: true,
  Uskayaw: true,
  Hepliaklqana: true,
  WuJian: true,
  Xom: true,
});

const Names = {
  [Gods.Zin]: 'Zin',
  [Gods.Yredelemnul]: 'Yredelemnul',
  [Gods.Okawaru]: 'Okawaru',
  [Gods.Makhleb]: 'Makhleb',
  [Gods.SifMuna]: 'Sif Muna',
  [Gods.Trog]: 'Trog',
  [Gods.Elyvilon]: 'Elyvilon',
  [Gods.Lugonu]: 'Lugonu',
  [Gods.Beogh]: 'Beogh',
  [Gods.Fedhas]: 'Fedhas',
  [Gods.Cheibriados]: 'Cheibriados',
  [Gods.Ashenzari]: 'Ashenzari',
  [Gods.Dithmenos]: 'Dithmenos',
  [Gods.NemelexXobeh]: 'Nemelex Xobeh',
  [Gods.Gozag]: 'Gozag',
  [Gods.Qazlal]: 'Qazlal',
  [Gods.Ru]: 'Ru',
  [Gods.Pakellas]: 'Pakellas',
  [Gods.Uskayaw]: 'Uskayaw',
  [Gods.Hepliaklqana]: 'Hepliaklqana',
  [Gods.WuJian]: 'Wu Jian',
  [Gods.Xom]: 'Xom',
};

module.exports = {
  ...Gods,
  Keys: Gods,
  Names,
  Regex: new RegExp(`(${Object.values(Names).join('|')})`),
};
