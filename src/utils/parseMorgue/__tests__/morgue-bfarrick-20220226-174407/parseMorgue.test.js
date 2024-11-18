import { expect, test } from 'bun:test';

import { test_parseMorgue } from '../test_parseMorgue';

// gift message comes after item received ... oof
//
//  70779 | Dis:3    | Identified a +9 broad axe of holy wrath (a +9 broad axe of
//                   | flaming blessed by the Shining One)
//  70779 | Dis:3    | Received a gift from the Shining One
//
const morgue_url = 'http://crawl.akrasiac.org/rawdata/bfarrick/morgue-bfarrick-20220226-174407.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
