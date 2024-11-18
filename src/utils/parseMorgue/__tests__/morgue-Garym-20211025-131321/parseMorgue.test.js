import { expect, test } from 'bun:test';

import { test_parseMorgue } from '../test_parseMorgue';

// gift message comes turn before found message
//
//  39531 | Slime:3  | Received a gift from Okawaru
//  39532 | Slime:3  | Found the +2 shield of Resistance {rF++ rC++ Will++}
//
const morgue_url = 'https://crawl.xtahua.com/crawl/morgue/Garym//morgue-Garym-20211025-131321.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
