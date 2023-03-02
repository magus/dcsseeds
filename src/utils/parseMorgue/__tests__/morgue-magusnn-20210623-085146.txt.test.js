import { test_parseMorgue } from './test_parseMorgue';

// 15 rune win, over 1400 events
const morgue_url = 'http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210623-085146.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
