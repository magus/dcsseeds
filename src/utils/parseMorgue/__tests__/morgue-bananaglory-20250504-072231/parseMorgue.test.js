import { expect, test } from 'bun:test';

import { test_parseMorgue } from '../test_parseMorgue';

// Necropolis branch in stash is parsed correctly
const morgue_url = 'https://crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20250504-072231.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
