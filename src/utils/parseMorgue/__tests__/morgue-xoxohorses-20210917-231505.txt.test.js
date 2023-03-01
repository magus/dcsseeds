import fs from 'fs';
import path from 'path';

import { parseMorgue } from '../parseMorgue';

// https://jestjs.io/docs/snapshot-testing

const test_case_list = [
  // gold dragon scales bought in shop parsed oddly
  // 20405 | D:8      | Bought runed gold dragon scales for 2075 gold pieces
  // 20405 | D:8      | Identified +1 gold dragon scales (You bought it in a shop
  //                  | on level 8 of the Dungeon)
  'http://crawl.akrasiac.org/rawdata/xoxohorses/morgue-xoxohorses-20210917-231505.txt',
];

for (const morgue_url of test_case_list) {
  test(morgue_url, async () => {
    const result = await setup_test(morgue_url);
    expect(result).toMatchSnapshot();
  });
}

async function setup_test(morgue_url) {
  const filename = path.basename(morgue_url);

  const filepath = path.join(__dirname, '..', '__fixtures__', filename);
  const buffer = fs.readFileSync(filepath);
  const content = String(buffer);

  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    async function text() {
      return content;
    }

    return { text };
  });

  return await parseMorgue(morgue_url);
}
