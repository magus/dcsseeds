import { expect, test } from 'bun:test';

import { test_parseMorgue } from '../test_parseMorgue';

// Bought items automatically identify artefacts
// So we want to avoid double logging when we hit the Found note

//  10460 | D:6      | Bought the +3 pair of seven-league boots {Rampage+âˆž} for
//                   | 1080 gold pieces
//  10460 | D:6      | Found the +3 pair of seven-league boots {Rampage+âˆž}
//
//  ...
//
//  34729 | Orc:2    | Bought the +2 hat of the Bear Spirit {Spirit, *Rage Will++}
//                   | for 849 gold pieces
//  34729 | Orc:2    | Found the +2 hat of the Bear Spirit {Spirit, *Rage Will++}
const morgue_url = 'https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
