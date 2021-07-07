import * as React from 'react';
import styled from 'styled-components';

import arrayToEnum from 'src/utils/arrayToEnum';
import StyledLink from 'src/components/StyledLink';

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

const EquipmentSlotList = ['Weapon', 'Shield', 'Body', 'Head', 'Back', 'Hands', 'Feet', 'Amulet', 'Ring'];
const EquipmentSlots = arrayToEnum(EquipmentSlotList);

function int(value) {
  return parseInt(value, 10);
}

const RE = {
  C: {
    Space: ' ',
    Comma: ',',
  },
  TraitCleanup: /,/i,
  TraitGroup: /\{(.*?)\}/i,
  Traits: {
    Brand: {
      RE: /^(speed|vorpal|vamp)$/i,
      Value: function brandValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    Modifier: {
      RE: /^([a-z]+)([+-]\d+)/i,
      Value: function modifierValue(match) {
        const [, type, valueString] = match;
        const value = int(valueString);
        return { type, value };
      },
    },
    Resist: {
      RE: /^(r[^+^-]+)$/,
      Value: function resistValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    Buffs: {
      RE: /^(sinv|reflect|spirit)$/i,
      Value: function buffsValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    Bips: {
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
    Ability: {
      RE: /^\+([^\s]+)/,
      Value: function abilityValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    Disabled: {
      RE: /^\-([^\s]+)/,
      Value: function disabledValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    NegativeEquip: {
      RE: /^\*([^\s]+)/,
      Value: function negativeEquipValue(match) {
        const [, type] = match;
        return { type };
      },
    },
    Uniques: {
      RE: /^(slay drac)$/,
      Value: function uniquesValue(match) {
        const [, type] = match;
        return { type };
      },
    },
  },
  EquipmentSlots: {
    [EquipmentSlots.Shield]: /(shield)/i,
    [EquipmentSlots.Body]: /(scale mail)/i,
    [EquipmentSlots.Head]: /(hat|helmet)/i,
    [EquipmentSlots.Back]: /(cloak|scarf)/i,
    [EquipmentSlots.Hands]: /(gauntlets|gloves)/i,
    [EquipmentSlots.Feet]: /(boots)/i,
    [EquipmentSlots.Amulet]: /(amulet)/i,
    [EquipmentSlots.Ring]: /(ring)/i,
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

  return EquipmentSlots.Weapon;
}

function parseTraits(description) {
  const traits = [];
  const invalidTraits = [];

  const traitsMatch = description.match(RE.TraitGroup);

  if (traitsMatch) {
    const [, allTraits] = traitsMatch;
    const traitsSplitComma = allTraits.split(RE.C.Comma).map((v) => v.trim());

    function parseTrait(trait, traitString) {
      const match = traitString.match(RE.Traits[trait].RE);
      if (match) {
        const value = RE.Traits[trait].Value(match);
        return { trait, value };
      }

      return null;
    }

    traitsSplitComma.forEach((traitsGroup) => {
      // match spaces unique traits before splitting on space
      const uniqueTrait = parseTrait('Uniques', traitsGroup);
      if (uniqueTrait) {
        traits.push(uniqueTrait);
      } else {
        traitsGroup.split(RE.C.Space).forEach((traitString) => {
          // look at each trait to match it
          const traitNames = Object.keys(RE.Traits);
          for (let i = 0; i < traitNames.length; i++) {
            const trait = traitNames[i];

            const parsedTrait = parseTrait(trait, traitString);
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

function Item(description) {
  this.description = description;
  this.type = parseType(description);
  const { traits, invalidTraits } = parseTraits(description);
  this.traits = traits;
  this.invalidTraits = invalidTraits;

  // take in a string description and parse into object representing item
  // e.g. `+18 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3}`
}

export default function Equip(props) {
  const items = [
    '+18 lance "Wyrmbane" {slay drac, rPois rF+ rC+ AC+3}',
    '+2 tower shield {AC+3}',
    '+0 scale mail of Decompression {*Drain rF++ rC- Int+8 Slay+3}',
    '-2 hat of the Alchemist {rElec rPois rF+ rC+ rN+ Will+ rMut rCorr}',
    '+2 cloak {Will+}',
    '+0 pair of gloves of Jim Fyec {*Contam rElec Int+5 Stlth+}',
    '+2 pair of boots {run}',
    'amulet of Pemah {RegenMP +Fly Will+ SInv}',
    'ring "Ajiojuh" {AC+4 Int+2 Dex+4}',
    'ring "Atwat" {rElec rPois MP+9 Str+6 Dex+2}',
    '+2 robe "Moedgh" {-Cast *Slow +Blink Regen+}',
    '+5 chain mail of Autumn {-Tele Will+ Dex+7}',
    '+0 scimitar of Nemelex Xobeh {speed, *Contam rN+ Str+7 Dex+2}',
    '+0 kite shield "Ykhlak" {+Inv rElec rF- Dex+6}',
    '+1 kite shield {reflect}',
    '+9 trident (vamp)',
    '+4 moon troll leather armour {Spirit, Regen++ MP+5}',
  ].map((desc) => new Item(desc));

  console.debug({ items });

  // took ~9s for 10,000,000,000 combinations (10 items per slot)
  // 10000000000 / (9 * 60 * 1000) ~= 18,518 iterations per ms
  // so first calculate if we can brute force and do that instead, if possible
  // we will need to calculate the time it takes to brute force a small stash

  return (
    <Container>
      <StyledLink href="/">Back to Home</StyledLink>
    </Container>
  );
}

const Container = styled.div`
  max-width: 640px;
  min-height: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
