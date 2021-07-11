import arrayToEnum from 'src/utils/arrayToEnum';

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

const EquipSlot = arrayToEnum(['Weapon', 'Shield', 'Body', 'Head', 'Back', 'Hands', 'Feet', 'Amulet', 'Ring']);

const ArmorType = {
  [EquipSlot.Shield]: arrayToEnum(['Buckler', 'Kite', 'Tower']),
  [EquipSlot.Head]: arrayToEnum(['Hat', 'Helmet']),
  [EquipSlot.Back]: arrayToEnum(['Cloak', 'Scarf']),
  [EquipSlot.Hands]: arrayToEnum(['Gloves']),
  [EquipSlot.Feet]: arrayToEnum(['Boots', 'Barding']),
  [EquipSlot.Amulet]: arrayToEnum(['Amulet']),
  [EquipSlot.Ring]: arrayToEnum(['Ring']),
  [EquipSlot.Body]: arrayToEnum([
    'Robe',
    'LeatherArmour',
    'RingMail',
    'ScaleMail',
    'ChainMail',
    'PlateArmour',
    'CrystalPlateArmour',
    'AnimalSkin',
    'TrollLeatherArmour',
    'SteamDragonScales',
    'AcidDragonScales',
    'SwampDragonScales',
    'QuicksilverDragonScales',
    'FireDragonScales',
    'IceDragonScales',
    'PearlDragonScales',
    'ShadowDragonScales',
    'StormDragonScales',
    'GoldDragonScales',
  ]),
};

const ArmorTypeMeta = {
  [EquipSlot.Shield]: {
    // [description, SH, Evasion Penalty]
    [ArmorType.Shield.Buckler]: ['Buckler', 3, 1],
    [ArmorType.Shield.Kite]: ['Kite shield', 8, 3],
    [ArmorType.Shield.Tower]: ['Tower shield', 13, 5],
  },
  [EquipSlot.Head]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Head.Hat]: ['Hat', 0, 0],
    [ArmorType.Head.Helmet]: ['Helmet', 1, 0],
  },
  [EquipSlot.Back]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Back.Cloak]: ['Cloak', 1, 0],
    [ArmorType.Back.Scarf]: ['Scarf', 0, 0],
  },
  [EquipSlot.Hands]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Hands.Gloves]: ['Gloves', 1, 0],
  },
  [EquipSlot.Feet]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Feet.Boots]: ['Boots', 1, 0],
    [ArmorType.Feet.Barding]: ['Barding', 4, -6],
  },
  [EquipSlot.Amulet]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Amulet.Amulet]: ['Amulet', 0, 0],
  },
  [EquipSlot.Ring]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Ring.Ring]: ['Ring', 0, 0],
  },
  [EquipSlot.Body]: {
    // [description, AC, Encumberance Rating]
    [ArmorType.Body.Robe]: ['Robe', 2, 0],
    [ArmorType.Body.LeatherArmour]: ['Leather armour', 3, 4],
    [ArmorType.Body.RingMail]: ['Ring mail', 5, 7],
    [ArmorType.Body.ScaleMail]: ['Scale mail', 6, 10],
    [ArmorType.Body.ChainMail]: ['Chain mail', 8, 15],
    [ArmorType.Body.PlateArmour]: ['Plate armour', 10, 18],
    [ArmorType.Body.CrystalPlateArmour]: ['Crystal plate armour', 14, 23],
    [ArmorType.Body.AnimalSkin]: ['Animal skin', 2, 0],
    [ArmorType.Body.TrollLeatherArmour]: ['Troll leather armour', 4, 4],
    [ArmorType.Body.SteamDragonScales]: ['Steam dragon scales', 5, 0],
    [ArmorType.Body.AcidDragonScales]: ['Acid dragon scales', 6, 5],
    [ArmorType.Body.SwampDragonScales]: ['Swamp dragon scales', 7, 7],
    [ArmorType.Body.QuicksilverDragonScales]: ['Quicksilver dragon scales', 9, 7],
    [ArmorType.Body.FireDragonScales]: ['Fire dragon scales', 8, 11],
    [ArmorType.Body.IceDragonScales]: ['Ice dragon scales', 9, 11],
    [ArmorType.Body.PearlDragonScales]: ['Pearl dragon scales', 10, 11],
    [ArmorType.Body.ShadowDragonScales]: ['Shadow dragon scales', 10, 15],
    [ArmorType.Body.StormDragonScales]: ['Storm dragon scales', 10, 15],
    [ArmorType.Body.GoldDragonScales]: ['Gold dragon scales', 12, 23],
  },
};

// Item takes in a string description and parse into object representing item
// e.g. `-2 hat of the Alchemist {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}`
export function Equipment(description) {
  this.description = description;

  const { slot, type } = parseType(description);
  this.slot = slot;
  this.type = type;

  this.traits = [];
  this.invalidTraits = [];

  // parse base AC of armor
  if (this.slot === EquipSlot.Weapon) {
    // for weapons, skip
  } else if (this.slot === EquipSlot.Shield) {
    // for shields, add SH
    const [, sh, evasionPenalty] = ArmorTypeMeta[this.slot][this.type];
    this.traits.push(createTrait(Trait.Modifier, `SH${mod(sh)}`));
  } else {
    // otherwise add AC
    const [, ac, encumberance] = ArmorTypeMeta[this.slot][this.type];
    this.traits.push(createTrait(Trait.Modifier, `AC${mod(ac)}`));
  }

  // parse ac bonus at front of item
  // e.g. +2 cloak {Will+}
  const bonusACMatch = description.match(RE.BonusAC);
  if (bonusACMatch) {
    const modifier = mod(bonusACMatch[1]);

    if (this.slot === EquipSlot.Weapon) {
      // for weapons, skip
    } else if (this.slot === EquipSlot.Shield) {
      // for shields, add to AC and SH
      this.traits.push(createTrait(Trait.Modifier, `AC${modifier}`));
      this.traits.push(createTrait(Trait.Modifier, `SH${modifier}`));
    } else {
      // otherwise add to AC
      this.traits.push(createTrait(Trait.Modifier, `AC${modifier}`));
    }
  }

  // parse traits
  // e.g. {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}
  const { traits, invalidTraits } = parseTraits(description);
  this.traits.push(...traits);
  this.invalidTraits.push(...invalidTraits);
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
};

function parseType(description) {
  const slots = Object.keys(ArmorTypeMeta);
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];

    // check each armor type in slot for match
    const armorSlotTypes = Object.keys(ArmorTypeMeta[slot]);
    for (let i = 0; i < armorSlotTypes.length; i++) {
      const type = armorSlotTypes[i];
      const armorTypeMeta = ArmorTypeMeta[slot][type];
      const [armorTypeString] = armorTypeMeta;
      const regex = new RegExp(armorTypeString, 'i');
      if (regex.test(description)) {
        return { slot, type };
      }
    }
  }

  return {
    slot: EquipSlot.Weapon,
    type: 'UNKNOWN',
  };
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

function mod(value) {
  const numericValue = int(value);
  return numericValue < 0 ? String(numericValue) : `+${numericValue}`;
}
