import { test_parseMorgue } from '../test_parseMorgue';

// Ashenzari cursed items spam identify into notes but we should skip them
// since they are invalid and a unique god gift, not a notable item
//
//  78246 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  78310 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  78325 | Vaults:4 | Noticed Xtahua
//  78339 | Vaults:3 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  78350 | Vaults:4 | Killed Xtahua
//  78604 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  78788 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  79063 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
//  79264 | Vaults:4 | Identified the cursed +3 rapier "Circumscribed Together"
//                   | {spect, Elem, Cun} (You found it on level 3 of the Dungeon)
const morgue_url = 'http://crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt';

// TODO fix parseMorgue to skip items with ashenzari curses parsed from god-abil.cc
test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
