import * as React from 'react';
import styled from 'styled-components';

import { Equipment, Stats } from 'src/utils/Equipment';
import StyledLink from 'src/components/StyledLink';

export default function Equip(props) {
  // client-side only
  if (!process.browser) {
    return null;
  }

  const stats = new Stats();
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
  ].map((desc) => new Equipment(desc));

  items.forEach((item) => {
    item.traits.forEach((trait) => {
      stats.addTrait(trait);
    });
  });

  console.debug({ stats, items });

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
