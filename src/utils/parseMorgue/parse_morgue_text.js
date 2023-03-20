import { uniqBy } from 'lodash';

import keyMirror from 'src/utils/keyMirror';
import { toNumber } from 'src/utils/toNumber';
import { find_list_backwards, iterate_backward, iterate_forward } from 'src/utils/find_list_backwards';
import { runRegex } from 'src/utils/runRegex';
import Backgrounds from 'src/utils/Backgrounds';
import Species from 'src/utils/Species';
import Gods from 'src/utils/Gods';
import Branch from 'src/utils/Branch';

import { parse_note } from './parse_note';

export async function parse_morgue_text(params) {
  const name = params.morgue.player;
  const morgue = params.morgue.url;
  const morgueText = params.morgue_text;
  const stash = params.stash;

  const args = { name, morgue, morgueText, stash };

  return {
    ...(await MORGUE_REGEX[MORGUE_FIELD.Version](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Filename](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.God](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Trunk](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Sprint](args)),
    ...(await MORGUE_REGEX[MORGUE_FIELD.Bloatcrawl](args)),
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
  Bloatcrawl: true,
  Seed: true,
  Score: true,
  SpeciesBackground: true,
  Turns: true,
  Time: true,
  Runes: true,
  Notes: true,
});

const MORGUE_REGEX = {
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

  // https://regexr.com/6ebp7
  [MORGUE_FIELD.Version]: async ({ morgueText }) => {
    try {
      const [, fullVersion, bcrawl, version] = await runRegex(
        MORGUE_FIELD.Version,
        morgueText,
        /version ((bcrawl-)?(\d+(?:\.\d+)+).*?)\s.*?character file./,
      );

      return { fullVersion, version, is_bcrawl: Boolean(bcrawl) };
    } catch (error) {
      throw new Error('invalid morgue text when parsing version');
    }
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
        new RegExp(`morgue-${name}-(\\d{8}-\\d{6}).txt`),
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

  // https://regexr.com/79j2o
  [MORGUE_FIELD.Bloatcrawl]: async ({ morgueText }) => {
    try {
      await runRegex(MORGUE_FIELD.Bloatcrawl, morgueText, /(Bloatcrawl).*?version.*?character file/);
      return { isBloatcrawl: true };
    } catch (err) {
      return { isBloatcrawl: false };
    }
  },

  // https://regexr.com/79rsi
  [MORGUE_FIELD.Trunk]: async ({ morgueText }) => {
    try {
      await runRegex(
        MORGUE_FIELD.Trunk,
        morgueText,
        /version ((\d+\.\d+(\.\d+)?)(-(a0|b1)(-|\s)).*?)\s.*?character file./,
      );
      return { isTrunk: true };
    } catch (err) {
      return { isTrunk: false };
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
      const [, runeCountString, , runesString] = await runRegex(
        MORGUE_FIELD.Runes,
        morgueText,
        /}: (\d+)\/(\d+) runes: ([a-z, \n]+)a:/,
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

  [MORGUE_FIELD.Notes]: async ({ morgue, morgueText, stash }) => {
    try {
      const morgueNotes = getAllMorgueNotes({ morgueText, morgue });
      const { events, eventErrors } = getAllMorgueNoteEvents({ morgueNotes, stash });
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

  const notes_line_index = morgueLines.findIndex((line) => {
    const notesStart = line.match(/^Notes$/m);
    // console.warn('checking line', line);
    if (notesStart) {
      // console.warn('notes start found');
      return true;
    }
  });

  // add 3 to skip the turn place note header lines
  const startLine = notes_line_index + 3;

  // start searching after start line to find WITHOUT note separator
  const line_without_separator_index = morgueLines.slice(startLine).findIndex((line) => {
    const hasNoteSeparator = !!~line.indexOf(NOTE_SEPARATOR);
    // console.warn('checking line', line);
    if (!hasNoteSeparator) {
      // console.warn('notes end found');
      return true;
    }
  });

  // go back a line to capture last valid note line
  const endLine = line_without_separator_index + startLine - 1;

  // console.warn({
  //   startLine: morgueLines[startLine],
  //   endLine: morgueLines[endLine],
  // });

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
        const location_data = get_location_data(loc);
        currentNote = { morgue, turn, loc, note, ...location_data };
      }
    }

    // console.warn({ thisLine, countSeparators, currentNote });
  }

  // add last note to notes
  notes.push(currentNote);

  return notes;
}

function getAllMorgueNoteEvents({ morgueNotes, stash }) {
  const eventErrors = [];
  const events = [];

  // run parseNote over each morgue note entry
  for (let note_index = 0; note_index < morgueNotes.length; note_index++) {
    const morgueNote = morgueNotes[note_index];

    try {
      parse_note({ morgueNote, addEvent, events, stash });

      // first note
      if (note_index === 0) {
        addEvent('first-event', morgueNote);
      }
      // last note
      if (note_index === morgueNotes.length - 1) {
        addEvent('last-event', morgueNote);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(error);
      }

      eventErrors.push({ error: error.message, morgueNote });
    }

    function addEvent(type, morgue_note, data) {
      const { turn, branch, level, note } = morgue_note;
      const event = new MorgueEvent({ type, turn, branch, level, note, data });
      validate_event(event);
      events.push(event);
    }

    // mutate event if necessary
    function validate_event(event) {
      switch (event.branch) {
        case 'Arena': {
          if (event.type !== 'item') {
            break;
          }

          // Okawaru Duel ability teleports to Arena branch
          // however if we find an item here we want to log
          // it on the branch we came from
          // Searching backward from this event is the best
          // effort way to do this, although it can be wrong
          // http://crawl.chaosforge.org/Okawaru
          find_list_backwards(morgueNotes.slice(0, note_index), (morgue_note) => {
            const { branch, level } = morgue_note;
            if (branch !== 'Arena') {
              // found most recent non Arena branch
              // mutate event data to this location
              Object.assign(event, { branch, level });

              // console.debug('lookback', { morgue_note, location_data, event });
              return true;
            }
          });

          break;
        }
        default:
        // noop
      }
    }
  }

  // remove duplicates (mutates existing array)
  // for example `noticed` (uniques noticed) can be registered multiple times
  // e.g. Mennas in the morgue below
  //      http://crawl.akrasiac.org/rawdata/KarmaDistortion/morgue-KarmaDistortion-20220206-104358.txt
  uniqBy(events, (i) => [i.type, i?.data?.item, i.branch, i.level].join('-'));

  post_process_events(events);

  return { events, eventErrors };
}

function visit_obj_fields(obj, visit) {
  for (const field of Object.keys(obj)) {
    if (typeof obj[field] === 'object') {
      visit_obj_fields(obj[field], visit);
    } else {
      visit(obj, field);
    }
  }
}

function post_process_events(event_list) {
  for (let i = 0; i < event_list.length; i++) {
    const event = event_list[i];

    // write location to even backwards compatability
    // we should remove if we update the database schema since branch/level is sufficient
    event.location = get_location(event.branch, event.level);

    // remove undefined fields
    visit_obj_fields(event, (obj, field) => {
      if (obj[field] === undefined) {
        delete obj[field];
      }
    });

    switch (true) {
      case event.type === 'god-gift': {
        const turn_threshold = 1;

        const delete_nearby_item_event = (other_event, i) => {
          const is_close_turn = Math.abs(event.turn - other_event.turn) <= turn_threshold;

          if (!is_close_turn) {
            // console.debug('NOT CLOSE TURN', { event, other_event });
            // must return a value here to exit!
            // undefined will continue since we assume undefined means it was unhandled
            return true;
          }

          if (is_close_turn && other_event.type === 'item') {
            // console.debug('DELETING ITEM EVENT NEAR GOD GIFT EVENT', { other_event, event });
            event_list.splice(i, 1);
            return i;
          }
        };

        iterate_backward(event_list, i, delete_nearby_item_event);
        iterate_forward(event_list, i, delete_nearby_item_event);

        break;
      }

      default:
      // noop
    }
  }
}

function MorgueEvent(field_obj) {
  return field_obj;
}

function get_location_data(raw_location) {
  const [rawBranch, level] = raw_location.split(':');
  const branch = Branch.getBranch(rawBranch);

  const location_data = { branch, level };
  return location_data;
}

function get_location(branch, level) {
  if (level) {
    return `${branch}:${level}`;
  }

  return branch;
}
