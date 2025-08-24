// Generated from `pnpm tsx scripts/AshenzariCurses`

// prettier-ignore
export const List = [
  {"id":"CURSE_MELEE","name":"Melee Combat","abbr":"Melee","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_RANGED","name":"Ranged Combat","abbr":"Range","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_ELEMENTS","name":"Elements","abbr":"Elem","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_ALCHEMY","name":"Alchemy","abbr":"Alch","version":"0.27","last_version":"0.30"},
  {"id":"CURSE_COMPANIONS","name":"Companions","abbr":"Comp","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_BEGUILING","name":"Beguiling","abbr":"Bglg","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_SELF","name":"Introspection","abbr":"Self","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_FORTITUDE","name":"Fortitude","abbr":"Fort","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_CUNNING","name":"Cunning","abbr":"Cun","version":"0.27","last_version":"0.33"},
  {"id":"CURSE_EVOCATIONS","name":"Evocations","abbr":"Evo","version":"0.27","last_version":"0.30"},
  {"id":"CURSE_SORCERY","name":"Sorcery","abbr":"Sorc","version":"0.31","last_version":"0.33"},
  {"id":"CURSE_DEVICES","name":"Devices","abbr":"Dev","version":"0.31","last_version":"0.33"},
] as const;

type Curse = (typeof List)[number];
type Abbr = Curse['abbr'];

// @ts-expect-error for loop assignment
export const ByAbbr: Record<Abbr, Curse> = {};
for (const curse of List) {
  ByAbbr[curse.abbr] = curse;
}
