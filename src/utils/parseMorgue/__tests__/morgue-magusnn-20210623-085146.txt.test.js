import fs from 'fs';
import path from 'path';

import { parseMorgue } from '../parseMorgue';

// https://jestjs.io/docs/snapshot-testing

const test_case_list = [
  // 15 rune win, over 1400 events
  'http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210623-085146.txt',
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
