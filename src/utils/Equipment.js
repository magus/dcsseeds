import arrayToEnum from 'src/utils/arrayToEnum';

// Health: 249/249    AC: 38    Str: 20    XL:     27
// Magic:  57/57      EV: 33    Int: 40    God:    Vehumet [******]
// Gold:   19647      SH: 29    Dex: 24    Spells: 8/80 levels left

// rFire    + + +     SeeInvis +   a - +18 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3}
// rCold    + + +     Faith    .   C - +2 tower shield {AC+3}
// rNeg     + + +     Spirit   .   H - +0 scale mail of Decompression {*Drain rF+ Int+8 Slay+3}
// rPois    ∞         Reflect  .   R - -2 hat of the Alchemist {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}
// rElec    +         Harm     .   u - +2 cloak {Will+}
// rCorr    +         Rampage  .   y - +0 pair of gloves of Jim Fyec {*Contam rElec Int+5 Stlth+}
// rMut     +         Clarity  +   o - +2 pair of boots {run}
// Will     +++++                  d - amulet of Pemah {RegenMP +Fly Will+ SInv}
// Stlth    ++++......             T - ring "Ajiojuh" {AC+4 Int+2 Dex+4}
// HPRegen  0.51/turn              v - ring "Atwat" {rElec rPois MP+9 Str+6 Dex+2}
// MPRegen  0.60/turn

// Weapon
// Shield
// Body
// Head
// Back
// Hands
// Feet
// Amulet
// Ring1
// Ring2

// rFire    + + +     SeeInvis +   a - +18 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3}
// rCold    + + +     Faith    .   C - +2 tower shield {AC+3}
// rNeg     + + +     Spirit   .   H - +0 scale mail of Decompression {*Drain rF+ Int+8 Slay+3}
// rPois    ∞         Reflect  .   R - -2 hat of the Alchemist {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}
// rElec    +         Harm     .   u - +2 cloak {Will+}
// rCorr    +         Rampage  .   y - +0 pair of gloves of Jim Fyec {*Contam rElec Int+5 Stlth+}
// rMut     +         Clarity  +   o - +2 pair of boots {run}
// Will     +++++                  d - amulet of Pemah {RegenMP +Fly Will+ SInv}
// Stlth    ++++......             T - ring "Ajiojuh" {AC+4 Int+2 Dex+4}
// HPRegen  0.51/turn              v - ring "Atwat" {rElec rPois MP+9 Str+6 Dex+2}
// MPRegen  0.60/turn

export function Stats() {
  // stats
  this.hp = 0;
  this.mp = 0;
  this.ac = 0;
  this.ev = 0;
  this.sh = 0;
  this.str = 0;
  this.int = 0;
  this.dex = 0;

  this.uniques = new Set();
  this.negatives = new Set();
  this.abilities = new Set();
  this.disabled = new Set();

  // traits
  this.rf = 0;
  this.rc = 0;
  this.rn = 0;
  this.rpois = false;
  this.relec = false;
  this.rcorr = false;
  this.rmut = false;
  this.will = 0;
  this.stlth = 0;
  this.regen = 0;
  this.regenmp = 0;
  this.sinv = false;
  this.faith = false;
  this.spirit = false;
  this.reflect = false;
  this.harm = false;
  this.rampage = false;
  this.clarity = false;

  // hidden traits
  this.slay = 0;
  this.run = false;

  // normalize stat name and throw error if not defined
  // throwing error here allows us to easily discover unhandled stats
  this.set = function setStat(nameString, setter) {
    const name = nameString.toLowerCase();
    if (this[name] === undefined) throw new Error(`Unexpected stat [${name}]`);
    this[name] = setter(this[name]);
  };

  // print a useful error when we fail to add a trait
  this.addTrait = function safeAddTrait(trait) {
    try {
      addTrait(this, trait);
    } catch (err) {
      console.error('[Stats]', 'safeAddTrait', { trait, err });
      throw err;
    }
  };
}

function addTrait(stats, trait) {
  switch (trait.type) {
    case Trait.Modifier: {
      // handle modifier trait
      stats.set(trait.value.type, (stat) => stat + trait.value.value);
      break;
    }
    case Trait.Buff: {
      stats.set(trait.value.type, () => true);
      break;
    }
    case Trait.Resist: {
      stats.set(trait.value.type, () => true);
      break;
    }
    case Trait.Bip: {
      stats.set(trait.value.type, (stat) => stat + trait.value.value);
      break;
    }
    case Trait.Negative: {
      stats.negatives.add(trait.value.type);
      break;
    }
    case Trait.Ability: {
      stats.abilities.add(trait.value.type);
      break;
    }
    case Trait.Disable: {
      stats.disabled.add(trait.value.type);
      break;
    }
    case Trait.Unique: {
      stats.uniques.add(trait.value.type);
      break;
    }
    case Trait.Brand: {
      // ignore weapon brands for now
      break;
    }
    default:
      throw new Error(`Unexpected trait [${JSON.stringify(trait)}]`);
  }
}

const EquipSlotList = ['Weapon', 'Shield', 'Body', 'Head', 'Back', 'Hands', 'Feet', 'Amulet', 'Ring'];
const EquipSlot = arrayToEnum(EquipSlotList);

// Item takes in a string description and parse into object representing item
// e.g. `-2 hat of the Alchemist {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}`
export function Equipment(description) {
  this.description = description;
  this.type = parseType(description);

  // parse traits
  // e.g. {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}
  const { traits, invalidTraits } = parseTraits(description);
  this.traits = traits;
  this.invalidTraits = invalidTraits;

  // parse ac bonus at front of item
  // e.g. +2 cloak {Will+}
  const bonusACMatch = description.match(RE.BonusAC);
  if (bonusACMatch) {
    const bonusAC = int(bonusACMatch[1]);
    const modifier = bonusAC < 0 ? String(bonusAC) : `+${bonusAC}`;

    if (this.type === EquipSlot.Weapon) {
      // for weapons, skip
    } else if (this.type === EquipSlot.Shield) {
      // for shields, add to AC and SH
      this.traits.push(createTrait(Trait.Modifier, `AC${modifier}`));
      this.traits.push(createTrait(Trait.Modifier, `SH${modifier}`));
    } else {
      // otherwise add to AC
      this.traits.push(createTrait(Trait.Modifier, `AC${modifier}`));
    }
  }
}

const TraitList = ['Brand', 'Modifier', 'Resist', 'Buff', 'Bip', 'Ability', 'Disable', 'Negative', 'Unique'];
const Trait = arrayToEnum(TraitList);

const RE = {
  C: {
    Space: ' ',
    Comma: ',',
  },

  // e.g. {reflect, SH+5, rF++}
  TraitGroup: /\{(.*?)\}/i,

  // e.g. +2 in +2 cloak
  BonusAC: /^([\+\-]\d+)? /,

  Traits: {
    [Trait.Brand]: {
      RE: /^(speed|vorpal|vamp)$/i,
      Value: function brandValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Modifier]: {
      RE: /^([a-z]+)([+-]\d+)/i,
      Value: function modifierValue(match) {
        const [, type, valueString] = match;
        const value = int(valueString);
        return { type, value };
      },
    },
    [Trait.Resist]: {
      // https://regexr.com/61lh0
      RE: /^(?!reflect$)(?!run$)(r[^+^-]+?)$/,
      Value: function resistValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Buff]: {
      RE: /^(sinv|reflect|spirit|run)$/i,
      Value: function buffsValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Bip]: {
      RE: /^((?:r|Will|Stlth|Regen|RegenMP)[^+^-]*)([+-]{1,3})?/,
      Value: function bipsValue(match) {
        const [, type, bips] = match;
        let value = 1;

        if (bips) {
          const sign = bips.charAt(0) === '+' ? +1 : -1;
          value = bips.length * sign;
        }

        return { type, value };
      },
    },
    [Trait.Ability]: {
      RE: /^\+([^\s]+)/,
      Value: function abilityValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Disable]: {
      RE: /^\-([^\s]+)/,
      Value: function disabledValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Negative]: {
      RE: /^\*([^\s]+)/,
      Value: function negativeEquipValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    [Trait.Unique]: {
      RE: /^(slay drac)$/,
      Value: function uniquesValue(match) {
        const [, type] = match;
        return { type };
      },
    },
  },
  EquipmentSlots: {
    [EquipSlot.Shield]: /(shield)/i,
    [EquipSlot.Body]: /(scale mail)/i,
    [EquipSlot.Head]: /(hat|helmet)/i,
    [EquipSlot.Back]: /(cloak|scarf)/i,
    [EquipSlot.Hands]: /(gauntlets|gloves)/i,
    [EquipSlot.Feet]: /(boots)/i,
    [EquipSlot.Amulet]: /(amulet)/i,
    [EquipSlot.Ring]: /(ring)/i,
  },
};

function parseType(description) {
  const slots = Object.keys(RE.EquipmentSlots);
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const regex = RE.EquipmentSlots[slot];
    if (regex.test(description)) {
      return slot;
    }
  }

  return EquipSlot.Weapon;
}

function createTrait(type, traitString) {
  const match = traitString.match(RE.Traits[type].RE);
  if (match) {
    const value = RE.Traits[type].Value(match);
    return { type, value };
  }

  return null;
}

function parseTraits(description) {
  const traits = [];
  const invalidTraits = [];

  const traitsMatch = description.match(RE.TraitGroup);

  if (traitsMatch) {
    const [, allTraits] = traitsMatch;
    const traitsSplitComma = allTraits.split(RE.C.Comma).map((v) => v.trim());

    traitsSplitComma.forEach((traitsGroup) => {
      // match spaces unique traits before splitting on space
      const uniqueTrait = createTrait(Trait.Unique, traitsGroup);
      if (uniqueTrait) {
        traits.push(uniqueTrait);
      } else {
        traitsGroup.split(RE.C.Space).forEach((traitString) => {
          // look at each trait to match it
          const traitNames = Object.keys(RE.Traits);
          for (let i = 0; i < traitNames.length; i++) {
            const trait = traitNames[i];

            const parsedTrait = createTrait(trait, traitString);
            if (parsedTrait) {
              traits.push(parsedTrait);

              // return so we do not fall into invalidTraits
              return null;
            }
          }

          // trait did not match, push into invalidTraits
          invalidTraits.push(traitString);
        });
      }
    });

    if (invalidTraits.length) {
      console.error('INVALID_TRAIT', invalidTraits, { description });
    }
  }

  return { traits, invalidTraits };
}

function int(value) {
  return parseInt(value, 10);
}
