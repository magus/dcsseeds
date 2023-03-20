import { find_list_backwards } from 'src/utils/find_list_backwards';
import Uniques from 'src/utils/Uniques';
import Gods from 'src/utils/Gods';
import Branch from 'src/utils/Branch';
import * as AshenzariCurses from 'src/utils/AshenzariCurses';

export function parse_note({ morgueNote, addEvent, events, stash }) {
  // check in this order to ensure we find most specific first

  // found regex cases
  // https://regexr.com/7a1qv
  // artefacts
  const found = morgueNote.note.match(/Found the (.*)?/);
  // altars, gates, portals, etc
  const found_altar = morgueNote.note.match(/Found (?:a|an) (?:.*?altar of (?<god>[^.]*))/);
  // shops
  const found_shop = morgueNote.note.match(/Found ((?!(the|a|an))[^.]*)/);

  const acquirement = morgueNote.note.match(/Acquired the (.*)?/);

  // gateway
  // https://regexr.com/6ervr
  const gateway = morgueNote.note.match(
    /Found a (one-way )?(gate|gateway) (leading )?to ((the|a|an) )?(?<branch>.*)\./,
  );

  // idents
  const identPortal = morgueNote.note.match(/Identified (?:the |a |an )?(.*) \(You found it in (?:the |a |an )?(.*)\)/);
  const identWithLoc = morgueNote.note.match(
    /Identified (?:the |a |an )?(.*) \(You found it on level (\d{1,2}) of (?:the |a |an )?(.*)\)/,
  );

  // boughts
  const identBoughtPortal = morgueNote.note.match(
    /Identified (?:the |a |an )?(.*) \(You bought it in a shop in (?:the |a |an )?(.*)\)/,
  );
  const identBoughtWithLoc = morgueNote.note.match(
    /Identified (?:the |a |an )?(.*) \(You bought it in a shop on level (\d{1,2}) of (?:the |a |an )?(.*)\)/,
  );

  // normal ident
  const ident = morgueNote.note.match(/Identified (?:the |a |an )?(.*)/);
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
  // Bought runed gold dragon scales for 2075 gold pieces
  const bought = morgueNote.note.match(/Bought (?:the |a |an )?(.*?) for (\d+) gold pieces/);

  const weildingWearing = morgueNote.note.match(/(wielding|wearing) the (.*?)(\.|and )/);

  // uniques noticed and killed
  const noticed = morgueNote.note.match(/Noticed (.*)$/);
  const killed = morgueNote.note.match(/Killed (.*)$/);

  // gods
  const joinGod = morgueNote.note.match(/Became a worshipper of (?<god>.*)$/);
  const leaveGod = morgueNote.note.match(/Fell from the grace of (?<god>.*)$/);
  const pietyLevel = morgueNote.note.match(/Reached (?<bips>\*+) piety under (?<god>.*)/);
  const god_gift = morgueNote.note.match(/Received a gift from (?<god>.*)/);
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
    /(?<kind>Gained|Lost) mutation: (?<desc>[^(^[]*?) (?:\((?<stat>.*?)\) )?\[(?<source>.*?)\]/,
  );

  if (noticed) {
    // Parse uniques encountered and defeated (if defeated or avoided if not)
    const [, who] = noticed;
    if (Uniques.Lookup[who]) {
      addEvent('unique-noticed', morgueNote, { who });
    }
  } else if (killed) {
    const [, who] = killed;
    if (Uniques.Lookup[who]) {
      addEvent('unique-killed', morgueNote, { who });
    }
  } else if (joinGod) {
    const god = Gods.parse_god(joinGod.groups.god);
    addEvent('join-god', morgueNote, { god });
  } else if (leaveGod) {
    const god = Gods.parse_god(leaveGod.groups.god);
    addEvent('leave-god', morgueNote, { god });
  } else if (pietyLevel) {
    addEvent('piety-god', morgueNote, { ...pietyLevel.groups });
  } else if (god_gift) {
    const { god } = god_gift.groups;
    addEvent('god-gift', morgueNote, { god });
  } else if (identGift) {
    const { item } = identGift.groups;
    const god = Gods.parse_god(identGift.groups.god);
    addEvent('god-gift', morgueNote, { item, god });
  } else if (spellGift) {
    addEvent('god-gift', morgueNote, { ...spellGift.groups });
  } else if (experienceLevel) {
    const [, level, hp, mp] = experienceLevel;
    addEvent('experience-level', morgueNote, { level, hp, mp });
  } else if (skillLevel) {
    addEvent('skill-level', morgueNote, { ...skillLevel.groups });
  } else if (manual) {
    addEvent('manual', morgueNote, { ...manual.groups });
  } else if (mutation) {
    addEvent('mutation', morgueNote, { ...mutation.groups });
  } else if (gateway) {
    const branch = Branch.getBranch(gateway.groups.branch);
    addEvent('portal', morgueNote, { branch });
  } else if (playerNotes) {
    const [, note] = playerNotes;
    addEvent('player-note', morgueNote, { note });
  } else if (pietyTrove) {
    const kind = 'piety';
    addEvent('trove', morgueNote, { kind });
  } else if (trove) {
    const [, item] = trove;
    const kind = 'item';
    addEvent('trove', morgueNote, { kind, item });
  } else if (spells) {
    // Parse out the spells into individual parseMorgue entries
    // https://regexr.com/5p55t
    const [, spellList] = spells;
    const [, commaSpells, lastSpell] = spellList.match(/(?:(.*) and )?(.*?)$/);
    commaSpells.split(', ').forEach((spell) => {
      addEvent('spell', morgueNote, { spell });
    });
    addEvent('spell', morgueNote, { spell: lastSpell });
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
        addEvent('wearing-who', morgueNote, { who, item });
        addEvent('item', morgueNote, { item });

        // next match
        match = reWieldingWearing.exec(morgueNote.note);
      }
    }
  } else if (bought) {
    const [, item, gold] = bought;

    // find valid shop event (not gozag call merchant shop)
    const shop_event = find_list_backwards(events, (event) => {
      if (event.type === 'shop') {
        if (event.branch === morgueNote.branch && event.level === morgueNote.level) {
          return event;
        }
      }
    });

    // mark bought event so we can log subsequent found event
    const is_valid_shop = Boolean(shop_event);

    // always log bought items
    addEvent('bought', morgueNote, { item, gold, is_valid_shop });

    // log item event if artefact and valid shop purchase
    const is_artefact = /{[^{^}]*?}/.test(item);
    if (is_valid_shop && is_artefact) {
      addEvent('item', morgueNote, { item, gold });
    }
  } else if (acquirement) {
    const [, item] = acquirement;
    addEvent('acquirement', morgueNote, { item });
  } else if (found_shop) {
    const [, name] = found_shop;

    // always log the shop event
    addEvent('shop', morgueNote, { name });

    // find matching shop in stash and parse out artefacts
    // this does not include gozag shops which is nice because they are random
    // if we want gozag shops we can rely on
    //   1. explicit `note_message` see https://github.com/magus/dcss/blob/3504e7f8600fc463b74bf948d59cf4ef08021291/compile-rc/parts/Morgue.rc#L156
    //   2. stash shop entries which are not found by this regex
    //
    for (const shop of stash.shop_list) {
      // there may be multiple matches so DO NOT break, go through entire shop_list
      if (
        shop.name === name &&
        shop.location.branch === morgueNote.branch &&
        shop.location.level === morgueNote.level
      ) {
        // console.debug('FOUND SHOP INVENTORY', { shop });
        for (const shop_item of shop.items) {
          if (shop_item.type === 'artefact') {
            // console.debug('FOUND ARTEFACT IN SHOP', { shop_item });

            const item = shop_item.name;
            const gold = shop_item.gold;

            addEvent('item', morgueNote, { item, gold });
          }
        }
      }
    }
  } else if (found_altar) {
    const god = Gods.parse_god(found_altar.groups.god);
    addEvent('altar', morgueNote, { god });
  } else if (found) {
    const [, item] = found;

    // check if this item was acquired (lookback at previous event)
    const last_event = events[events.length - 1];
    if (last_event.type === 'acquirement' && last_event.data.item === item) {
      // skip this found item since it was acquired
      // console.debug('skipping found acquired', { item });
      return;
    }

    // check if this item was bought in immediate preceding event
    if (last_event.type === 'bought' && last_event.data.item === item) {
      if (!last_event.data.is_valid_shop) {
        // skip this found item since it was bought from invalid shop
        // e.g. gozag call merchant
        // console.debug('SKIP PREVIOUS BOUGHT', { morgueNote, last_event });
      } else {
        const { gold } = last_event.data;
        // console.debug('FOUND PREVIOUS BOUGHT', { morgueNote, last_event });
        addEvent('item', morgueNote, { item, gold });
      }

      return;
    }

    // check if this item was logged in previous bought event
    if (last_event.type === 'item' && last_event.data.item === item) {
      // skip this found item since it was already logged
      // console.debug('SKIP PREVIOUS BOUGHT', { morgueNote, last_event });
      return;
    }

    // for some reason ring of the octopus king is both 'found' and 'identified'
    // the first 'found' event often has no details on the stats
    // so we ignore it to prevent logging a useless value
    const ignore_set = new Set();
    ignore_set.add('ring of the Octopus King');

    if (ignore_set.has(item)) {
      // skip ignored items
      return;
    }

    addEvent('found', morgueNote, { item });
    addEvent('item', morgueNote, { item });
  } else if (identPortal) {
    const [, item, loc] = identPortal;
    if (is_ashenzari_curse(item)) {
      return;
    }

    // clone morgue note and update location for accurate item log
    const modified_morgueNote = { ...morgueNote };
    modified_morgueNote.branch = Branch.getBranch(loc);
    delete modified_morgueNote.level;

    addEvent('ident-portal', modified_morgueNote, { item });
    addEvent('item', modified_morgueNote, { item });
  } else if (identWithLoc) {
    const [, item, level, loc] = identWithLoc;
    if (is_ashenzari_curse(item)) {
      return;
    }

    // clone morgue note and update location for accurate item log
    const modified_morgueNote = { ...morgueNote };
    modified_morgueNote.branch = Branch.getBranch(loc);
    modified_morgueNote.level = level;

    addEvent('ident-loc', modified_morgueNote, { item });
    addEvent('item', modified_morgueNote, { item });
  } else if (identBoughtPortal) {
    const [, item, loc] = identBoughtPortal;
    if (is_ashenzari_curse(item)) {
      return;
    }

    // clone morgue note and update location for accurate item log
    const modified_morgueNote = { ...morgueNote };
    modified_morgueNote.branch = Branch.getBranch(loc);
    delete modified_morgueNote.level;

    const gold = find_previous_bought_price(events, item);
    addEvent('ident-bought-portal', modified_morgueNote, { item, gold });
    addEvent('item', modified_morgueNote, { item, gold });
  } else if (identBoughtWithLoc) {
    const [, item, level, loc] = identBoughtWithLoc;
    if (is_ashenzari_curse(item)) {
      return;
    }

    // clone morgue note and update location for accurate item log
    const modified_morgueNote = { ...morgueNote };
    modified_morgueNote.branch = Branch.getBranch(loc);
    modified_morgueNote.level = level;

    const gold = find_previous_bought_price(events, item);
    addEvent('ident-bought-loc', modified_morgueNote, { item, gold });
    addEvent('item', modified_morgueNote, { item, gold });
  } else if (identIgnore) {
    // const [, item] = identIgnore;
    // console.warn('ident-ignore', morgueNote, { item });
  } else if (ident) {
    const [, item] = ident;

    if (is_ashenzari_curse(item)) {
      return;
    }

    addEvent('ident', morgueNote, { item });
    addEvent('item', morgueNote, { item });
  }
}

function find_previous_bought_price(events, item) {
  const item_type = get_item_type(item);

  if (!item_type) {
    throw new Error('unable to get item type');
  }

  // look back at previous events for a bought with item type
  const gold = find_list_backwards(events, (event) => {
    if (event.type === 'bought') {
      // does this bought event include the item type name
      //   item_type = 'robe'
      //   event.data.item = 'creamy pearl robe'
      //   bought_type = true
      const bought_type = event.data.item.includes(item_type);

      if (bought_type) {
        // console.debug('FOUND', { item, item_type, event });
        return event.data.gold;
      }
    }
  });

  if (!gold) {
    console.error({ item, item_type });
    throw new Error('unable to find matching bought event');
  }

  return gold;
}

function get_item_type(item) {
  const item_type_match = item.match(/^([+|-]\d+ )?(?<item_type>[^\s]+)/);
  if (item_type_match) {
    const { item_type } = item_type_match.groups;
    return item_type;
  }
  return null;
}

function is_ashenzari_curse(item_name) {
  const property_list = get_property_list(item_name);

  for (const property of property_list) {
    if (AshenzariCurses.ByAbbr[property]) {
      return true;
    }
  }

  return false;
}

function get_property_list(item_name) {
  const property_list_match = item_name.match(RE.property_list);

  if (!property_list_match) {
    return [];
  }

  const { property_list_string } = property_list_match.groups;
  const property_list = property_list_string.split(RE.property_list_split);

  // console.debug({ item_name, property_list });
  return property_list;
}

const RE = {
  property_list: /{(?<property_list_string>.*)}/,
  property_list_split: /, | /,
};
