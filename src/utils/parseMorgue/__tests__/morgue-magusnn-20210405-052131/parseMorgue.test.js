import { test_parseMorgue } from '../test_parseMorgue';

// multiple shops with same name
const morgue_url = 'http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210405-052131.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
