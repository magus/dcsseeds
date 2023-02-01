import { UNRANDS } from 'src/utils/Unrands';
import { random, randomElement } from 'src/utils/random';

export function random_placeholder() {
  const list = random() > 0.5 ? BRANDS : UNRANDS;
  const placeholder = randomElement(list);
  return placeholder;
}

// Item brands
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/item-name.cc
const BRANDS = [
  '+Fly',
  '+Inv',
  '+Rage',
  'AC',
  'AC+3',
  'Acrobat',
  'archery',
  'Archmagi',
  'Dex',
  'Dex+3',
  'EV',
  'Fly',
  'harm',
  'Int',
  'Int+3',
  'MP+9',
  'ponderous',
  'rampage',
  'rC+',
  'rCorr',
  'reflect',
  'Regen',
  'rF+',
  'rN+',
  'rPois',
  'shadows',
  'SInv',
  'Slay',
  'Spirit',
  'Stlth+',
  'Str',
  'Str+3',
  'Will+',
];
