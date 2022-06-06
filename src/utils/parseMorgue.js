const keyMirror = require('src/utils/keyMirror');
const { toNumber } = require('src/utils/toNumber');
const runRegex = require('src/utils/runRegex');
const Backgrounds = require('src/utils/Backgrounds');
const Species = require('src/utils/Species');
const Uniques = require('src/utils/Uniques');
const Gods = require('src/utils/Gods');
const Branch = require('src/utils/Branch');

const { uniqBy } = require('lodash');

module.exports = async function parseMorgue(morgue) {
  const morgueResponse = await fetch(morgue);
  const morgueText = await morgueResponse.text();

  // https://regexr.com/5ed8a
  const [, name] = await runRegex('name', morgue, /\/([^\/]+)\/+([^\/]+)\.txt(?:\.gz)?$/);

  const morgueParsed = await parseMorgueText({ name, morgue, morgueText });

  return {
    name,
    morgue,
    ...morgueParsed,
  };
};

async function parseMorgueText({ name, morgue, morgueText }) {
  const args = { name, morgue, morgueText };

  return {
    ...(await MORGUE_REGEX[MORGUE_FIELD.God](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Filename](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Version](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Trunk](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Sprint](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Seed](args)), // value
    ...(await MORGUE_REGEX[MORGUE_FIELD.Score](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.SpeciesBackground](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Turns](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Time](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Runes](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Notes](args)),
  };
}

const MORGUE_FIELD = keyMirror({
  God: true,
  Filename: true,
  Version: true,
  Trunk: true,
  Sprint: true,
  Seed: true,
  Score: true,
  SpeciesBackground: true,
  Turns: true,
  Time: true,
  Runes: true,
  Notes: true,
});

export const MORGUE_REGEX = {
  [MORGUE_FIELD.God]: async function ({ morgueText }) {
    let god = null;
    try {
      // e.g. God:    the Shining One
      // https://regexr.com/5plrt
      const [, parsedGod] = await runRegex(MORGUE_FIELD.God, morgueText, /God:(.*?)(?:\[.*)?$/im);
      [, god] = runRegex('god', parsedGod, Gods.Regex);
    } catch (err) {
      // god unable to be parsed, probably no god
      // console.error('MORGUE_REGEX', MORGUE_FIELD.God, err);
    }

    return { god };
  },

  [MORGUE_FIELD.Filename]: async function ({ name, morgue }) {
    let datetime = null;
    let isMorgue = false;

    // detect morgues to throw out/ignore in submit but still allow parseMorgue api to work
    // if this regex doesn't match it isn't a morgue, if it does it is
    try {
      const match = await runRegex(
        MORGUE_FIELD.Filename,
        morgue,
        // regex
        new RegExp(`morgue-${name}-(\\d{8}-\\d{6})\.txt`),
      );

      if (match) {
        isMorgue = true;

        const [, timestampString] = match;
        const [, Y, M, D, h, m, s] = /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(timestampString);
        const dateString = `${Y}-${M}-${D}T${h}:${m}:${s}.000Z`;
        datetime = new Date(dateString);
      }
    } catch (err) {
      // unable to parse so defaults to isMorgue = false and undefined datetime
    }

    return { isMorgue, datetime };
  },

  // https://regexr.com/6ebp7
  [MORGUE_FIELD.Version]: async ({ morgueText }) => {
    const [, fullVersion, bcrawl, version] = await runRegex(
      MORGUE_FIELD.Version,
      morgueText,
      /version ((bcrawl-)?(\d+(?:\.\d+)+).*?)\s.*?character file./,
    );

    return { fullVersion, version, is_bcrawl: Boolean(bcrawl) };
  },

  // https://regexr.com/6ebqt
  [MORGUE_FIELD.Sprint]: async ({ morgueText }) => {
    try {
      await runRegex(MORGUE_FIELD.Sprint, morgueText, /(Sprint).*?version.*?character file/);

      // Sprint in version line, this is a sprint run
      // Dungeon Sprint DCSS version 0.27-a0-1308-gc08437e (webtiles) character file.
      return { isSprint: true };
    } catch (err) {
      // unable to parse Sprint from version line, not a sprint run
      // Seeded DCSS version 0.27.1-34-g3ba077f (webtiles) character file.
      // Dungeon Crawl Stone Soup version 0.27.1-34-g3ba077f (webtiles) character file.
      return { isSprint: false };
    }
  },

  // https://regexr.com/6ebpa
  [MORGUE_FIELD.Trunk]: async ({ morgueText }) => {
    try {
      const [, fullVersion, version] = await runRegex(
        MORGUE_FIELD.Trunk,
        morgueText,
        /version ((\d+\.\d+\.\d+).*?)\s.*?character file./,
      );

      return { isTrunk: false };
    } catch (err) {
      // unable to parse version because version is a trunk version
      // e.g. 0.29-a0-23-ga79f92a
      return { isTrunk: true };
    }
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
      const [, background] = await runRegex('background', speciesBackground, Backgrounds.Regex);
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
        /}: (\d+)\/(\d+) runes: ([a-z\, \n]+)a:/,
      );

      const runes = runesString.split(',').map((rune) => rune.trim());
      const runeCount = toNumber(runeCountString);

      return { runes, runeCount };
    } catch (err) {
      // no runes match, return empties
      // seed_player will also default these fields in admin console
      return { runes: [], runeCount: 0 };
    }
  },

  [MORGUE_FIELD.Notes]: async ({ morgue, morgueText }) => {
    try {
      const morgueNotes = getAllMorgueNotes({ morgueText, morgue });
      const { events, eventErrors } = getAllMorgueNoteEvents(morgueNotes);
      const eventCount = events.length;

      return { eventCount, events, eventErrors };
    } catch (err) {
      console.error('MORGUE_FIELD.Notes', err);
      // return empty
      return { eventCount: 0, events: [], eventErrors: [{ error: err.message, stack: err.stack }] };
    }
  },
};

function getAllMorgueNotes({ morgueText, morgue }) {
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
        currentNote = { morgue, turn, loc, note };
      }
    }

    // console.warn({ thisLine, countSeparators, currentNote });
  }

  // add last note to notes
  notes.push(currentNote);

  return notes;
}

function getAllMorgueNoteEvents(morgueNotes) {
  const eventErrors = [];

  const events = [];
  const addEvent = (type, location, data) => events.push(createEvent(type, location, data));

  function parseNote(morgueNote) {
    // check in this order to ensure we find most specific first
    // Regex Tests
    // Idenfitied: https://regexr.com/5csa7
    // Found: https://regexr.com/5csaa
    const found = morgueNote.note.match(/Found the (.*)?/);
    const acquirement = morgueNote.note.match(/Acquired the (.*)?/);

    // gateway
    // https://regexr.com/6ervr
    const gateway = morgueNote.note.match(
      /Found a (one-way )?(gate|gateway) (leading )?to ((the|a|an) )?(?<branch>.*)\./,
    );

    // idents
    const identPortal = morgueNote.note.match(/Identified the (.*) \(You found it in (?:the |a |an )?(.*)\)/);
    const identWithLoc = morgueNote.note.match(
      /Identified the (.*) \(You found it on level (\d{1,2}) of (?:the |a |an )?(.*)\)/,
    );

    // boughts
    const identBoughtPortal = morgueNote.note.match(
      /Identified the (.*) \(You bought it in a shop in (?:the |a |an )?(.*)\)/,
    );
    const identBoughtWithLoc = morgueNote.note.match(
      /Identified the (.*) \(You bought it in a shop on level (\d{1,2}) of (?:the |a |an )?(.*)\)/,
    );

    // normal ident
    const ident = morgueNote.note.match(/Identified the (.*)/);
    // use randbook details to match generated book names
    // https://github.com/crawl/crawl/tree/master/crawl-ref/source/dat/database/randbook.txt
    // Examples
    // Tome of Congealing Earth (You acquired it on level 1 of the Vaults)
    const identIgnore = morgueNote.note.match(
      /Identified the ((Tome|Grimoire|Almanac|Volume|Compendium|Handbook|Incunabulum|Papyrus|Catalogue|Guide|Collected Works|Disquisition|Reference Book)(.*))/,
    );

    // https://regexr.com/5fqgo
    const trove = morgueNote.note.match(/This trove (?:needs|requires) (.*) to function/);
    const pietyTrove = morgueNote.note.match(/This portal proclaims the superiority of the material over the divine/);

    const spells = morgueNote.note.match(/You add the spells? (.*) to your library/);
    const playerNotes = morgueNote.note.match(/^(>>.*)/);

    // Bought a +1 buckler of cold resistance for 181 gold pieces
    // Bought the amulet of the Manifold Knives {Acrobat rElec rF+} for 816 gold pieces
    // Bought an uncursed ring of resist corrosion for 320 gold pieces
    const bought = morgueNote.note.match(/Bought (?:the |a |an )?(.*?) for (\d+) gold pieces/);

    const weildingWearing = morgueNote.note.match(/(wielding|wearing) the (.*?)(\.|and )/);

    // uniques noticed and killed
    const noticed = morgueNote.note.match(/Noticed (.*)$/);
    const killed = morgueNote.note.match(/Killed (.*)$/);

    // gods joined and left
    const joinGod = morgueNote.note.match(/Became a worshipper of (?<god>.*)$/);
    const leaveGod = morgueNote.note.match(/Fell from the grace of (?<god>.*)$/);
    const pietyLevel = morgueNote.note.match(/Reached (?<bips>\*+) piety under (?<god>.*)/);
    const spellGift = morgueNote.note.match(/Offered knowledge of (?<spell>.*) by (?<god>.*?)\./);
    // https://regexr.com/6equf
    const identGift = morgueNote.note.match(
      /Identified the (?<item>.*) \((?<god>.*?) gifted it to you (on level (?<level>\d+) of|in) ((the|a|an) )?(?<branch>.*)\)/,
    );

    const experienceLevel = morgueNote.note.match(/Reached XP level (\d*). HP: \d+\/(\d*) MP: \d+\/(\d*)/);
    const skillLevel = morgueNote.note.match(/Reached skill level (?<level>\d+) in (?<skill>.*)/);
    const manual = morgueNote.note.match(/Acquired a manual of (?<skill>.*)/);

    // mutations
    // https://regexr.com/6eqt8
    // Gained mutation: You are partially covered in iridescent scales. (AC +2) [potion of mutation]
    // Gained mutation: You passively dampen the noise of your surroundings. [potion of mutation]
    // Gained mutation: Your flesh is heat resistant. (rF+) [a neqoxec]
    // Gained mutation: You are weak. (Str -2) [an orb of fire]
    // Lost mutation: You tend to lose your temper in combat. [potion of mutation]
    // Lost mutation: Your magical capacity is low. (-10% MP) [potion of mutation]
    // Lost mutation: You have hidden genetic potential. [a cacodemon]
    // Lost mutation: You have an increased reservoir of magic. (+10% MP) [a cacodemon]
    const mutation = morgueNote.note.match(
      /(?<kind>Gained|Lost) mutation: (?<desc>[^\(^\[]*?) (?:\((?<stat>.*?)\) )?\[(?<source>.*?)\]/,
    );

    if (noticed) {
      // Parse uniques encountered and defeated (if defeated or avoided if not)
      const [, who] = noticed;
      if (Uniques.Lookup[who]) {
        addEvent('unique-noticed', morgueNote.loc, { who });
      }
    } else if (killed) {
      const [, who] = killed;
      if (Uniques.Lookup[who]) {
        addEvent('unique-killed', morgueNote.loc, { who });
      }
    } else if (joinGod) {
      const [, god] = runRegex('god', joinGod.groups.god, Gods.Regex);
      addEvent('join-god', morgueNote.loc, { god });
    } else if (leaveGod) {
      const [, god] = runRegex('god', leaveGod.groups.god, Gods.Regex);
      addEvent('leave-god', morgueNote.loc, { god });
    } else if (pietyLevel) {
      const [, god] = runRegex('god', pietyLevel.groups.god, Gods.Regex);
      addEvent('piety-god', morgueNote.loc, { ...pietyLevel.groups });
    } else if (identGift) {
      const { item } = identGift.groups;
      const [, god] = runRegex('god', identGift.groups.god, Gods.Regex);
      addEvent('god-gift', morgueNote.loc, { item, god });
    } else if (spellGift) {
      const [, god] = runRegex('god', spellGift.groups.god, Gods.Regex);
      addEvent('god-gift', morgueNote.loc, { ...spellGift.groups });
    } else if (experienceLevel) {
      const [, level, hp, mp] = experienceLevel;
      addEvent('experience-level', morgueNote.loc, { level, hp, mp });
    } else if (skillLevel) {
      addEvent('skill-level', morgueNote.loc, { ...skillLevel.groups });
    } else if (manual) {
      addEvent('manual', morgueNote.loc, { ...manual.groups });
    } else if (mutation) {
      addEvent('mutation', morgueNote.loc, { ...mutation.groups });
    } else if (gateway) {
      const branch = Branch.getBranch(gateway.groups.branch);
      addEvent('portal', morgueNote.loc, { branch });
    } else if (playerNotes) {
      const [, note] = playerNotes;
      addEvent('player-note', morgueNote.loc, { note });
    } else if (pietyTrove) {
      const kind = 'piety';
      addEvent('trove', morgueNote.loc, { kind });
    } else if (trove) {
      const [, item] = trove;
      const kind = 'item';
      addEvent('trove', morgueNote.loc, { kind, item });
    } else if (spells) {
      // Parse out the spells into individual parseMorgue entries
      // https://regexr.com/5p55t
      const [, spellList] = spells;
      const [, commaSpells, lastSpell] = spellList.match(/(?:(.*) and )?(.*?)$/);
      commaSpells.split(', ').forEach((spell, i) => {
        addEvent('spell', morgueNote.loc, { spell });
      });
      addEvent('spell', morgueNote.loc, { spell: lastSpell });
    } else if (weildingWearing) {
      // What https://regexr.com/5e13q
      // Who  https://regexr.com/5e14f
      // Maggie is wielding the +9 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3}.
      // a deep elf elementalist comes into view. It is wielding a +1 scythe of protection and wearing the cursed +1 leather armour "Gaoloj" {*Corrode rN++ SInv}.
      // a deep elf annihilator comes into view. It is wielding a +0 short sword and wearing the amulet of the Four Winds {rN+ MR+++ Clar}.
      // Gastronok the Ponderous comes into view. He is wielding the +9 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3} and wearing the cursed +1 leather armour "Gaoloj" {*Corrode rN++ SInv}.
      // a vault guard opens the door. It is wielding the +7 mace of Variability {chain chaos}.
      // The vault guard is wielding the +7 mace of Variability {chain chaos}.

      // pull out the 'who'
      const matchWho = morgueNote.note.match(/^((the |a |an )?(.*?) (is|opens the door|comes into view))/i);
      if (matchWho) {
        const [, , , who] = matchWho;

        // match each wielding or wearing in the note
        const reWieldingWearing = /(wielding|wearing) the (.*?)(\.|and )/g;
        let match = reWieldingWearing.exec(morgueNote.note);
        while (match) {
          const [, , item] = match;
          addEvent('wearing-who', morgueNote.loc, { who, item });
          addEvent('item', morgueNote.loc, { item });

          // next match
          match = reWieldingWearing.exec(morgueNote.note);
        }
      }
    } else if (bought) {
      const [, item, gold] = bought;
      const artefactMatch = item.match(/{.*?}/);
      if (artefactMatch) {
        addEvent('bought', morgueNote.loc, { item, gold });
        addEvent('item', morgueNote.loc, { item });
      }
    } else if (acquirement) {
      const [, item] = acquirement;
      addEvent('acquirement', morgueNote.loc, { item });
    } else if (found) {
      const [, item] = found;
      addEvent('found', morgueNote.loc, { item });
      addEvent('item', morgueNote.loc, { item });
    } else if (identPortal) {
      const [, item, loc] = identPortal;
      addEvent('ident-portal', loc, { item });
      addEvent('item', loc, { item });
    } else if (identWithLoc) {
      const [, item, level, loc] = identWithLoc;
      addEvent('ident-loc', `${loc}:${level}`, { item });
      addEvent('item', `${loc}:${level}`, { item });
    } else if (identBoughtPortal) {
      const [, item, loc] = identBoughtPortal;
      addEvent('ident-bought-portal', loc, { item });
      addEvent('item', loc, { item });
    } else if (identBoughtWithLoc) {
      const [, item, level, loc] = identBoughtWithLoc;
      addEvent('ident-bought-loc', `${loc}:${level}`, { item });
      addEvent('item', `${loc}:${level}`, { item });
    } else if (identIgnore) {
      const [, item] = identIgnore;
      console.warn('ident-ignore', morgueNote.loc, { item });
    } else if (ident) {
      const [, item] = ident;
      addEvent('ident', morgueNote.loc, { item });
      addEvent('item', morgueNote.loc, { item });
    }
  }

  // run parseNote over each morgue note entry
  for (let i = 0; i < morgueNotes.length; i++) {
    const morgueNote = morgueNotes[i];

    try {
      parseNote(morgueNote);

      // first note
      if (i === 0) {
        addEvent('first-event', morgueNote.loc, morgueNote.note);
      }
      // last note
      if (i === morgueNotes.length - 1) {
        addEvent('last-event', morgueNote.loc, morgueNote.note);
      }
    } catch (error) {
      eventErrors.push({ error: error.message, morgueNote });
    }
  }

  // remove duplicates (mutates existing array)
  // for example `noticed` (uniques noticed) can be registered multiple times
  // e.g. Mennas in the morgue below
  //      http://crawl.akrasiac.org/rawdata/KarmaDistortion/morgue-KarmaDistortion-20220206-104358.txt
  uniqBy(events, (i) => `__T${i.type}____N${i.name}____L${i.location}__`);

  return { events, eventErrors };
}

function createEvent(type, location, data) {
  return { type, ...getLocation(location), data };
}

function getLocation(value) {
  const [rawBranch, level] = value.split(':');
  const branch = Branch.getBranch(rawBranch);
  const location = level ? `${branch}:${level}` : branch;

  return { location, branch, level };
}
