import { test_parseMorgue } from '../test_parseMorgue';

// Gozag Call Merchant generated shops are ignored
const morgue_url = 'http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20210214-230342.txt';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
