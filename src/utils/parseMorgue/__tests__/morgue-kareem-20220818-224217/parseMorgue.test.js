import { test_parseMorgue } from '../test_parseMorgue';

// incorrectly parsed 0.30-a0 as non-trunk
const morgue_url = 'https://crawl.kelbi.org/crawl/morgue/kareem/morgue-kareem-20220818-224217.txt.gz';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
