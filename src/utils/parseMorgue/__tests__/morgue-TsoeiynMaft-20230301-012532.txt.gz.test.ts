import { expect, test } from '@jest/globals';
import { test_parseMorgue } from './test_parseMorgue';

// detect bloatware crawl versions
const morgue_url = 'https://crawl.kelbi.org/crawl/morgue/TsoeiynMaft/morgue-TsoeiynMaft-20230301-012532.txt.gz';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});

test('isTrunk', async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result.isTrunk).toBe(true);
});
