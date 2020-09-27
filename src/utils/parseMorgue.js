const keyMirror = require('src/utils/keyMirror');
const runRegex = require('src/utils/runRegex');
const Species = require('src/utils/Species');

module.exports = async function parseMorgue(morgue) {
  const morgueResponse = await fetch(morgue);
  const morgueText = await morgueResponse.text();

  const [, name] = await runRegex('name', morgue, /rawdata\/(.*?)\//);
  const morgueParsed = await parseMorgueText(name, morgueText);

  return {
    name,
    morgue,
    ...morgueParsed,
  };
};

async function parseMorgueText(name, morgueText) {
  const args = { name, morgueText };

  return {
    ...(await MORGUE_REGEX[MORGUE_FIELD.Version](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Seed](args)), // value
    ...(await MORGUE_REGEX[MORGUE_FIELD.Score](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.SpeciesBackground](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Turns](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Time](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Runes](args)),
  };
}

const MORGUE_FIELD = keyMirror({
  Version: true,
  Seed: true,
  Score: true,
  SpeciesBackground: true,
  Turns: true,
  Time: true,
  Runes: true,
});

const MORGUE_REGEX = {
  [MORGUE_FIELD.Version]: async ({ morgueText }) => {
    const [, fullVersion, version] = await runRegex(
      MORGUE_FIELD.Version,
      morgueText,
      /version ((\d+\.\d+)\..*?)\s.*?character file./,
    );
    return { fullVersion, version };
  },

  [MORGUE_FIELD.Seed]: async ({ morgueText }) => {
    const [, value] = await runRegex(MORGUE_FIELD.Seed, morgueText, /Game seed: (\d+)/);
    return { value };
  },

  [MORGUE_FIELD.Score]: async ({ name, morgueText }) => {
    const [, score] = await runRegex(
      MORGUE_FIELD.Score,
      morgueText,
      new RegExp(`Game seed: \\d+[^\\d]*?(\\d+) ${name}`),
    );
    return { score };
  },

  [MORGUE_FIELD.SpeciesBackground]: async ({ name, morgueText }) => {
    const [, speciesBackground] = await runRegex(MORGUE_FIELD.SpeciesBackground, morgueText, /Began as a (.*?) on/);

    const [, species] = await runRegex('species', speciesBackground, Species.Regex);
    const background = speciesBackground.replace(species, '').trim();
    return { species, background };
  },

  [MORGUE_FIELD.Turns]: async ({ morgueText }) => {
    const [, turnsString] = await runRegex(MORGUE_FIELD.Turns, morgueText, /Turns: (\d+)/);
    const turns = toNumber(turnsString);

    return { turns };
  },

  [MORGUE_FIELD.Time]: async ({ morgueText }) => {
    const [, timeString] = await runRegex(MORGUE_FIELD.Time, morgueText, /Time: ([\d:]+)/);
    const [hours, minutes, seconds] = timeString.split(':').map(toNumber);
    const timeSeconds = hours * 60 * 60 + minutes * 60 + seconds;
    return { timeSeconds };
  },

  [MORGUE_FIELD.Runes]: async ({ morgueText }) => {
    try {
      const [match, runeCountString, runeTotalString, runesString] = await runRegex(
        MORGUE_FIELD.Runes,
        morgueText,
        /}: (\d)\/(\d+) runes: ([a-z\, ]+)/,
      );

      const runes = JSON.stringify(runesString.split(', '));
      const runeCount = toNumber(runeCountString);

      return { runes, runeCount };
    } catch (err) {
      // no runes match, return empty
      // seed_player will default to `runeCount: 0, runes: []`
      return {};
    }
  },
};

const toNumber = (value) => parseInt(value, 10);
