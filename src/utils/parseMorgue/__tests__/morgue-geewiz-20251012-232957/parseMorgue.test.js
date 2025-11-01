import { expect, test } from 'bun:test';

import { test_parseMorgue } from '../test_parseMorgue';

// Necropolis branch in stash is parsed correctly
const morgue_url = 'http://crawl.akrasiac.org/rawdata/geewiz/morgue-geewiz-20251012-232957.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
