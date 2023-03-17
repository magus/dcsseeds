import { test_parseMorgue } from './test_parseMorgue';

// very short morgue with empty stash
const morgue_url = 'https://crawl.kelbi.org/crawl/morgue/CKag/morgue-CKag-20221113-181534.txt.gz';

test(morgue_url, async () => {
  const result = await test_parseMorgue(morgue_url);
  expect(result).toMatchSnapshot();
});
