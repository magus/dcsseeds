const keyMirror = require('src/utils/keyMirror');
const { toNumber } = require('src/utils/toNumber');
const runRegex = require('src/utils/runRegex');
const Backgrounds = require('src/utils/Backgrounds');
const Species = require('src/utils/Species');

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
  God: true,
  Filename: true,
  Version: true,
  Seed: true,
  Score: true,
  SpeciesBackground: true,
  Turns: true,
  Time: true,
  Runes: true,
  Items: true,
});

export const MORGUE_REGEX = {
  [MORGUE_FIELD.God]: async function ({ morgueText }) {
    let god = null;
    try {
      // e.g. God:    the Shining One
      // https://regexr.com/5plrt
      const [, parsedGod] = await runRegex(MORGUE_FIELD.God, morgueText, /God:\s+([a-z\s]*?)(?:\[.*)?$/im);
      god = parsedGod;
    } catch (err) {
      // god unable to be parsed
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

  [MORGUE_FIELD.Version]: async ({ morgueText }) => {
    const [, fullVersion, version] = await runRegex(
      MORGUE_FIELD.Version,
      morgueText,
      /version ((\d+\.\d+).*?)\s.*?character file./,
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
      console.error('MORGUE_FIELD.Items', err);
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

  function createItem(type, name, _location, _level) {
    let branch;
    let level;

    if (!!~_location.indexOf(':')) {
      const locationSplit = _location.split(':');
      branch = getBranch(locationSplit[0]);
      level = locationSplit[1];
    } else {
      branch = getBranch(_location);
    }

    const location = level ? `${branch}:${level}` : branch;
    return items.push({ type, name, location, branch, level });
  }

  function parseNote(morgueNote) {
    try {
      // check in this order to ensure we find most specific first
      // Regex Tests
      // Idenfitied: https://regexr.com/5csa7
      // Found: https://regexr.com/5csaa
      const found = morgueNote.note.match(/Found the (.*)?/);
      const gift = morgueNote.note.match(/gifted it to you/);

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
      const ziggurat = morgueNote.note.match(/Found a gateway to a ziggurat/);

      // Bought a +1 buckler of cold resistance for 181 gold pieces
      // Bought the amulet of the Manifold Knives {Acrobat rElec rF+} for 816 gold pieces
      // Bought an uncursed ring of resist corrosion for 320 gold pieces
      const bought = morgueNote.note.match(/Bought (?:the |a |an )?(.*?) for (\d+) gold pieces/);

      const weildingWearing = morgueNote.note.match(/(wielding|wearing) the (.*?)(\.|and )/);

      if (gift) {
        // skip gifts
        return;
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
            createItem('wearingWho', `(${who}) ${item}`, morgueNote.loc);
            createItem('item', item, morgueNote.loc);

            // next match
            match = reWieldingWearing.exec(morgueNote.note);
          }
        }
      } else if (bought) {
        const [, item, gold] = bought;
        const artefactMatch = item.match(/{.*?}/);
        if (artefactMatch) {
          createItem('bought', `${item} (${gold} gold)`, morgueNote.loc);
          createItem('item', item, morgueNote.loc);
        }
      } else if (ziggurat) {
        createItem('ziggurat', 'Ziggurat', morgueNote.loc);
      } else if (playerNotes) {
        const [, note] = playerNotes;
        createItem('note', `${note} (Player Note)`, morgueNote.loc);
      } else if (pietyTrove) {
        createItem('trovePiety', `Treasure Trove (lose all piety)`, morgueNote.loc);
      } else if (trove) {
        const [, item] = trove;
        createItem('troveItem', `Treasure Trove (${item})`, morgueNote.loc);
      } else if (spells) {
        // Parse out the spells into individual parseMorgue entries
        // https://regexr.com/5p55t
        const [, spellList] = spells;
        const [, commaSpells, lastSpell] = spellList.match(/(?:(.*) and )?(.*?)$/);
        commaSpells.split(', ').forEach((spell, i) => {
          createItem('spell', spell, morgueNote.loc);
        });
        createItem('spell', lastSpell, morgueNote.loc);
      } else if (found) {
        const [, item] = found;
        createItem('found', item, morgueNote.loc);
        createItem('item', item, morgueNote.loc);
      } else if (identPortal) {
        const [, item, loc] = identPortal;
        createItem('identPortal', item, loc);
        createItem('item', item, loc);
      } else if (identWithLoc) {
        const [, item, level, loc] = identWithLoc;
        createItem('identLoc', item, `${loc}:${level}`);
        createItem('item', item, `${loc}:${level}`);
      } else if (identBoughtPortal) {
        const [, item, loc] = identBoughtPortal;
        createItem('identBoughtPortal', item, loc);
        createItem('item', item, loc);
      } else if (identBoughtWithLoc) {
        const [, item, level, loc] = identBoughtWithLoc;
        createItem('identBoughtLoc', item, `${loc}:${level}`);
        createItem('item', item, `${loc}:${level}`);
      } else if (identIgnore) {
        // const [, item] = identIgnore;
        // console.warn('identIgnore', { item });
      } else if (ident) {
        const [, item] = ident;
        createItem('ident', item, morgueNote.loc);
        createItem('item', item, morgueNote.loc);
      }
    } catch (err) {
      console.error(`ERROR; SKIPPING NOTE [${JSON.stringify(morgueNote, null, 2)}]`);
      console.error('MORGUE_FIELD.Items', 'parseNote', err);
    }
  }

  // run parseNote over each morgue note entry
  morgueNotes.forEach(parseNote);

  // remove duplicates
  const dedupedItems = uniqBy(items, (i) => `__T${i.type}____N${i.name}____L${i.location}__`);

  return dedupedItems;
}

function getBranch(branch) {
  return BRANCH_NAMES[branch.toLowerCase()] || branch;
}

// Branch name data
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/branch-data.h
const BRANCH_NAMES = {
  abyss: 'Abyss',
  bailey: 'Bailey',
  bazaar: 'Bazaar',
  blade: 'Blade',
  'hall of blades': 'Blade',
  coc: 'Cocytus',
  cocytus: 'Cocytus',
  crypt: 'Crypt',
  depths: 'Depths',
  desolati: 'Desolation',
  desolation: 'Desolation',
  'desolation of salt': 'Desolation',
  dis: 'Dis',
  'iron city of dis': 'Dis',
  d: 'Dungeon',
  dungeon: 'Dungeon',
  dwarf: 'Dwarf',
  'dwarven hall': 'Dwarf',
  elf: 'Elf',
  'elven halls': 'Elf',
  forest: 'Forest',
  'enchanted forest': 'Forest',
  gauntlet: 'Gauntlet',
  geh: 'Gehenna',
  gehenna: 'Gehenna',
  'vestibule of hell': 'Hell',
  hell: 'Hell',
  icecv: 'IceCave',
  'ice cave': 'IceCave',
  lab: 'Labyrinth',
  labyrinth: 'Labyrinth',
  lair: 'Lair',
  'lair of beasts': 'Lair',
  orc: 'Orc',
  'orcish mines': 'Orc',
  ossuary: 'Ossuary',
  pan: 'Pandemonium',
  pandemonium: 'Pandemonium',
  'pits of slime': 'Slime',
  slime: 'Slime',
  'slime pits': 'Slime',
  'realm of zot': 'Zot',
  zot: 'Zot',
  sewer: 'Sewer',
  shoals: 'Shoals',
  snake: 'Snake',
  'snake pit': 'Snake',
  spider: 'Spider',
  'spider nest': 'Spider',
  swamp: 'Swamp',
  tar: 'Tartarus',
  tartarus: 'Tartarus',
  tomb: 'Tomb',
  'tomb of the ancients': 'Tomb',
  'treasure trove': 'Trove',
  trove: 'Trove',
  vaults: 'Vaults',
  volcano: 'Volcano',
  wizlab: 'WizLab',
  "wizard's laboratory": 'WizLab',
  zig: 'Ziggurat',
  ziggurat: 'Ziggurat',
};
