import Branch from 'src/utils/Branch';
import { toNumber } from 'src/utils/toNumber';

// yarn test src/utils/parseMorgue/__tests__/morgue-magusnn-20210623-085146.txt.test.js

export function parse_stash_text(stash_text) {
  const stash_line_list = stash_text.split('\n');

  const state = {};
  state.stash = {};
  state.stash.branch = {};
  // shops can have the same duplicate name
  // this is a list to ensure we collect all shops
  state.stash.shop_list = [];
  state.stash.artefact_list = [];

  state.current = {};
  // skip first two lines, player name and blank line
  state.current.line_index = 2;
  state.current.level_list = null;
  state.current.item = null;
  state.current.shop = null;
  state.current.location = { branch: null, level: null };
  state.current.position = { x: 0, y: 0 };

  function peek() {
    return stash_line_list[state.current.line_index];
  }

  function read() {
    return stash_line_list[state.current.line_index++];
  }

  function check(type) {
    const match = peek().match(RE[type]);

    if (!match) return false;

    const success = PARSE[type]({ match, state });

    if (!success) return false;

    // if (peek() === '  +2 ice dragon scales (2592 gold)') {
    //   console.debug({ type, success, match });
    //   throw new Error('DEBUG');
    // }

    // consume line and proceed
    read();
    return true;
  }

  try {
    while (peek() !== undefined) {
      switch (true) {
        case peek() === '': {
          // skip blank lines
          read();
          break;
        }

        case check('no_stash'):
          break;

        case check('unseen'):
          break;

        case check('shop'):
          break;

        case check('consumable'):
          break;

        case check('item_desc'):
          break;

        case check('item_name'):
          break;

        case check('position'):
          break;

        case check('location'):
          break;

        default:
          throw new Error('unrecognized line in stash');
      }
    }
  } catch (error) {
    // console.dir({ state }, { depth: null });
    console.error(state.current.line_index, read());
    throw error;
  }

  // remove current state
  delete state.current;

  // write json file for debugging purposes
  // require('fs').writeFileSync(require('path').join(__dirname, 'stash.txt'), stash_text);
  // require('fs').writeFileSync(require('path').join(__dirname, 'stash.json'), JSON.stringify(state, null, 2));

  return state.stash;
}

const PARSE = {
  location: function location({ match, state }) {
    let branch;

    try {
      branch = Branch.getBranch(match.groups.branch);
    } catch (error) {
      return false;
    }

    // reset active shop
    state.current.shop = null;

    if (!state.stash.branch[branch]) {
      state.stash.branch[branch] = {};
    }

    const level = match.groups.level || '0';

    state.current.location.branch = branch;
    state.current.location.level = level;

    state.current.level_list = [];
    state.stash.branch[branch][level] = state.current.level_list;

    return true;
  },

  position: function position({ match, state }) {
    // reset active shop
    state.current.shop = null;

    state.current.position.x = toNumber(match.groups.x);
    state.current.position.y = toNumber(match.groups.y);
    return true;
  },

  item_name: function item_name({ match, state }) {
    if (!match) {
      console.error({ match, state });
      throw new Error('STOP');
    }
    const properties = [];
    const name = match.groups.name;

    const type = (function get_type() {
      switch (true) {
        case RE.spellbook.test(name):
          return 'spellbook';
        case match.groups.article === 'the':
          return 'artefact';
        default:
          return 'item';
      }
    })();

    const location = { ...state.current.location };
    state.current.item = { type, name, location, properties };

    const gold = match.groups.gold ? toNumber(match.groups.gold) : undefined;

    if (gold) {
      state.current.item.gold = gold;
    }

    if (type === 'artefact') {
      state.stash.artefact_list.push(state.current.item);
    }

    if (state.current.shop) {
      state.current.shop.items.push(state.current.item);
    } else {
      state.current.item.position = { ...state.current.position };
      state.current.level_list.push(state.current.item);
    }

    return true;
  },

  item_desc: function item_desc({ match, state }) {
    const desc = match.groups.desc;

    if (desc) {
      state.current.item.properties.push(desc);
    }

    return true;
  },

  consumable: function consumable({ match, state }) {
    const properties = [];
    const name = match.groups.name;
    const count = toNumber(match.groups.count);
    const location = { ...state.current.location };
    state.current.item = { type: 'consumable', name, count, location, properties };

    const gold = match.groups.gold ? toNumber(match.groups.gold) : undefined;

    if (gold) {
      state.current.item.gold = gold;
    }

    if (state.current.shop) {
      state.current.shop.items.push(state.current.item);
    } else {
      state.current.item.position = { ...state.current.position };
      state.current.level_list.push(state.current.item);
    }

    return true;
  },

  shop: function shop({ match, state }) {
    const items = [];
    const name = match.groups.name;
    state.current.shop = { type: 'shop', name, items };
    state.stash.shop_list.push(state.current.shop);
    state.current.level_list.push(state.current.shop);

    return true;
  },

  unseen: function unseen({ state }) {
    state.current.level_list.push({ type: 'unseen' });
    return true;
  },

  no_stash: function no_stash() {
    return true;
  },
};

const RE = {
  // https://regex101.com/r/NidpSF/1
  location: /^(?:Level (?<level>\d+) of )?(?:the )?(?<branch>.*)$/,
  // https://regex101.com/r/YUc3yc/1
  position: /^\((?<x>-?\d+), (?<y>-?\d+), (?<location>.*?)\)$/,
  // https://regex101.com/r/cZbOr2/1
  item_name: /^ {2}(?:(?<article>the|a|an) )?(?<name>.*?)(?: \((?<gold>\d+) gold\))?$/,
  // https://regex101.com/r/0rcBGC/1
  item_desc: /^ {4}(?<desc>.*)$/,
  // https://regex101.com/r/7flQ7E/1
  consumable: /^ {2}(?<count>\d+) (?<name>.*?)(?: \((?<gold>\d+) gold\))?$/,
  // https://regex101.com/r/ecxmmt/1
  shop: /\[Shop\] (?<name>.*)$/,

  unseen: / {2}\(unseen\)/,
  no_stash: / {2}You have no stashes\./,

  // https://github.com/crawl/crawl/blob/master/crawl-ref/source/dat/database/randbook.txt
  spellbook: /^(book of |Almanac|Annotations|Anthology|Atlas|Book|Catalogue|Codex|Collected Works|Commentary|Compendium|Compilation|Cyclopedia|Directory|Discourse|Discursus|Disquisition|Dissertation|Elucidation|Enchiridion|Encyclopedia|Essays|Excursus|Exposition|Folio|Grimoire|Guide|Guidebook|Handbook|Incunable|Incunabulum|Information|Lectures|Lessons|Meditations|Monograph|Notes|Octavo|Omnibus|Opusculum|Papyrus|Parchment|Precepts|Quarto|Reference Book|Secrets|Spellbook|Teachings|Textbook|Thoughts|Tome|Tractate|Treatise|Vademecum|Vellum|Verses|Volume|Writings)/,
};
