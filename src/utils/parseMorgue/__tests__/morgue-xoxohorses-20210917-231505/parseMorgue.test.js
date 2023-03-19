import { test_parseMorgue } from '../test_parseMorgue';

// gold dragon scales bought in shop parsed oddly
// 20405 | D:8      | Bought runed gold dragon scales for 2075 gold pieces
// 20405 | D:8      | Identified +1 gold dragon scales (You bought it in a shop
//                  | on level 8 of the Dungeon)
const morgue_url = 'http://crawl.akrasiac.org/rawdata/xoxohorses/morgue-xoxohorses-20210917-231505.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
