import keyMirror from 'src/utils/keyMirror';
import { runRegex_safe } from 'src/utils/runRegex';

const Gods = keyMirror({
  Ashenzari: true,
  Beogh: true,
  Cheibriados: true,
  Dithmenos: true,
  Elyvilon: true,
  Fedhas: true,
  Gozag: true,
  Hepliaklqana: true,
  Ignis: true,
  Jiyva: true,
  Kikubaaqudgha: true,
  Lugonu: true,
  Makhleb: true,
  Nemelex: true,
  Okawaru: true,
  Qazlal: true,
  Ru: true,
  SifMuna: true,
  Trog: true,
  Uskayaw: true,
  Vehumet: true,
  WuJian: true,
  Xom: true,
  Yredelemnul: true,
  Zin: true,
  ShiningOne: true,
});

const Names = {
  [Gods.Ashenzari]: 'Ashenzari',
  [Gods.Beogh]: 'Beogh',
  [Gods.Cheibriados]: 'Cheibriados',
  [Gods.Dithmenos]: 'Dithmenos',
  [Gods.Elyvilon]: 'Elyvilon',
  [Gods.Fedhas]: 'Fedhas',
  [Gods.Gozag]: 'Gozag',
  [Gods.Hepliaklqana]: 'Hepliaklqana',
  [Gods.Ignis]: 'Ignis',
  [Gods.Jiyva]: 'Jiyva',
  [Gods.Kikubaaqudgha]: 'Kikubaaqudgha',
  [Gods.Lugonu]: 'Lugonu',
  [Gods.Makhleb]: 'Makhleb',
  [Gods.Nemelex]: 'Nemelex',
  [Gods.Okawaru]: 'Okawaru',
  [Gods.Qazlal]: 'Qazlal',
  [Gods.Ru]: 'Ru',
  [Gods.SifMuna]: 'Sif Muna',
  [Gods.Trog]: 'Trog',
  [Gods.Uskayaw]: 'Uskayaw',
  [Gods.Vehumet]: 'Vehumet',
  [Gods.WuJian]: 'Wu Jian',
  [Gods.Xom]: 'Xom',
  [Gods.Yredelemnul]: 'Yredelemnul',
  [Gods.Zin]: 'Zin',
  [Gods.ShiningOne]: 'Shining One',
};

const NAME_REGEX = new RegExp(`(?<god>${Object.values(Names).join('|')})`);

function parse_god(god_string) {
  let god;

  if (god_string === 'an unknown god') {
    god = 'Unknown';
  } else {
    const match = runRegex_safe('parse_god', god_string, NAME_REGEX);

    if (match) {
      god = match.groups.god;
    }
  }

  if (!god) {
    throw new Error('parse_god unrecognized god');
  }

  return god;
}

// backwards compatability with old module.exports
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  ...Gods,
  Keys: Gods,
  Names,
  Regex: NAME_REGEX,
  parse_god,
};
