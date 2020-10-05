const keyMirror = require('src/utils/keyMirror');
const runRegex = require('src/utils/runRegex');
const Species = require('src/utils/Species');

module.exports = async function parseMorgue(morgue) {
  const morgueResponse = await fetch(morgue);
  const morgueText = await morgueResponse.text();

  const [, name] = await runRegex('name', morgue, /rawdata\/(.*?)\//);

  // detect morgues to throw out/ignore in submit but still allow parseMorgue api to work
  const isMorgue = !!morgue.match(new RegExp(`morgue-${name}-\\d{8}-\\d{6}.txt`));

  const morgueParsed = await parseMorgueText(name, morgueText);

  return {
    name,
    morgue,
    isMorgue,
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
    ...(await MORGUE_REGEX[MORGUE_FIELD.Items](args)),
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
  Items: true,
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
    try {
      const [, value] = await runRegex(MORGUE_FIELD.Seed, morgueText, /Game seed: (\d+)/);
      return { value };
    } catch (err) {
      // unable to parse seed, most likely not a morgue
      return { value: null };
    }
  },

  [MORGUE_FIELD.Score]: async ({ name, morgueText }) => {
    try {
      const [, score] = await runRegex(
        MORGUE_FIELD.Score,
        morgueText,
        new RegExp(`Game seed: \\d+[^\\d]*?(\\d+) ${name}`),
      );

      return { score };
    } catch (err) {
      // no score, unfinished run maybe?
      return { score: 0 };
    }
  },

  [MORGUE_FIELD.SpeciesBackground]: async ({ name, morgueText }) => {
    async function parseSpeciesBackground(speciesBackground) {
      const [, species] = await runRegex('species', speciesBackground, Species.Regex);
      const background = speciesBackground.replace(species, '').trim();
      return { species, background };
    }

    try {
      const [, speciesBackground] = await runRegex(MORGUE_FIELD.SpeciesBackground, morgueText, /Began as an? (.*?) on/);
      return await parseSpeciesBackground(speciesBackground);
    } catch (err) {
      try {
        // try alternate format
        const [, speciesBackground] = await runRegex(
          MORGUE_FIELD.SpeciesBackground,
          morgueText,
          new RegExp(`${name}.*?\\((.*?)\\)`),
        );
        return await parseSpeciesBackground(speciesBackground);
      } catch (alternateErr) {
        return { species: null, background: null };
      }
    }
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

      const runes = runesString.split(', ');
      const runeCount = toNumber(runeCountString);

      return { runes, runeCount };
    } catch (err) {
      // no runes match, return empties
      // seed_player will also default these fields in admin console
      return { runes: [], runeCount: 0 };
    }
  },

  [MORGUE_FIELD.Items]: async ({ morgueText }) => {
    try {
      const morgueNotes = getAllMorgueNotes(morgueText);
      const items = getAllMorgueItems(morgueNotes);

      return { items };
    } catch (err) {
      // return empty
      return {};
    }
  },
};

function getAllMorgueNotes(morgueText) {
  const NOTE_SEPARATOR = '|';
  const morgueLines = morgueText.split('\n');

  // add 3 to skip the turn place note header lines
  const startLine =
    morgueLines.findIndex((line) => {
      const notesStart = line.match(/^Notes$/m);
      // console.warn('checking line', line);
      if (notesStart) {
        // console.warn('notes start found');
        return true;
      }
    }) + 3;

  // start searching after start line and go back a line to capture last valid
  // note line instad of the line that failed to match note separator
  const endLine =
    morgueLines.slice(startLine).findIndex((line) => {
      const hasNoteSeparator = !!~line.indexOf(NOTE_SEPARATOR);
      // console.warn('checking line', line);
      if (!hasNoteSeparator) {
        // console.warn('notes end found');
        return true;
      }
    }) +
    (startLine - 1);

  // console.warn({ startLine: morgueLines[startLine], endLine: morgueLines[endLine] });

  // go through for each line and regroup separated lines into
  // a better shape for iteration and parsing
  //
  // Example
  // 56910 | Crypt:3  | Got a slimy hand crossbow {crossbow}
  // 56913 | Crypt:3  | Identified the +10 great sword of the Common Good {vorpal,
  //                  | *Contam rPois Str+4 Dex+2, long} (You found it on level 3
  //                  | of the Crypt)
  // 56914 | Crypt:3  | Identified the +10 hand crossbow "Afaehaar" {elec, Str+4,
  //                  | crossbow} (You found it on level 3 of the Crypt)
  // 57138 | Tomb:1   | Entered Level 1 of the Tomb of the Ancients
  //
  // ...becomes...
  //
  const notes = [];
  let currentNote = null;

  function parseNoteLine(line) {
    return line.split(NOTE_SEPARATOR).map((_) => _.trim());
  }

  for (let i = startLine; i <= endLine; i++) {
    const thisLine = morgueLines[i];
    // console.warn('checking', i, thisLine);

    const countSeparators = thisLine.match(new RegExp(`\\${NOTE_SEPARATOR}`, 'g')).length;
    switch (countSeparators) {
      case 1:
        {
          // continue currentNote, append to note field
          const [, note] = parseNoteLine(thisLine);
          // console.warn('continue note', { currentNote, note });
          currentNote.note = `${currentNote.note} ${note}`;
        }
        break;
      case 2:
      default: {
        // new note found
        // if there is a currentNote, its finished
        // push it onto notes
        if (currentNote) {
          notes.push(currentNote);
        }
        // start new note for thisLine
        const [turn, loc, note] = parseNoteLine(thisLine);
        currentNote = { turn, loc, note };
      }
    }

    // console.warn({ thisLine, countSeparators, currentNote });
  }

  // add last note to notes
  notes.push(currentNote);

  return notes;
}

function getAllMorgueItems(morgueNotes) {
  const items = [];

  function createItem(name, location) {
    return items.push({ name, location });
  }

  morgueNotes.forEach((morgueNote) => {
    // check in this order to ensure we find most specific first
    // Regex Tests
    // Idenfitied: https://regexr.com/5csa7
    // Found: https://regexr.com/5csaa
    const found = morgueNote.note.match(/Found the (.*)?/);
    const gift = morgueNote.note.match(/gifted it to you/);
    const identSpecialLoc = morgueNote.note.match(/Identified the (.*) \(You found it in a (.*)\)/);
    const identWithLoc = morgueNote.note.match(/Identified the (.*) \(You found it on level (.*) of the (.*)\)/);
    const ident = morgueNote.note.match(/Identified the (.*)/);
    const trove = morgueNote.note.match(/This trove needs (.*) to function/);
    const spells = morgueNote.note.match(/You add the spells? (.*) to your library/);
    const playerNotes = morgueNote.note.match(/^(>>.*)/);
    const ziggurat = morgueNote.note.match(/Found a gateway to a ziggurat/);
    // Found a gateway to a ziggurat.

    if (gift) {
      // skip gifts
      return;
    }
    if (ziggurat) {
      createItem('Ziggurat', morgueNote.loc);
    } else if (playerNotes) {
      const [, note] = playerNotes;
      createItem(`${note} (Player Note)`, morgueNote.loc);
    } else if (trove) {
      const [, item] = trove;
      createItem(`Treasure Trove (${item})`, morgueNote.loc);
    } else if (spells) {
      const [, item] = spells;
      createItem(item, morgueNote.loc);
    } else if (found) {
      const [, item] = found;
      createItem(item, morgueNote.loc);
    } else if (identSpecialLoc) {
      const [, item, loc] = identSpecialLoc;
      createItem(item, loc);
    } else if (identWithLoc) {
      const [, item, level, loc] = identWithLoc;
      createItem(item, `${loc}:${level}`);
    } else if (ident) {
      const [, item] = ident;
      createItem(item, morgueNote.loc);
    }
  });

  return items;
}

const toNumber = (value) => parseInt(value, 10);
