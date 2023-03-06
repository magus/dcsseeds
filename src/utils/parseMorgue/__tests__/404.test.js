import { test_parseMorgue } from './test_parseMorgue';

// sometimes servers respond with a blank morgue file
// this fixture simulates that
const morgue_url = 'http://crawl.akrasiac.org/rawdata/notfound/morgue-notfound-20230306-010905.txt';

test(morgue_url, async () => {
  await expect(() => test_parseMorgue(morgue_url)).rejects.toThrow('invalid morgue text when parsing version');
});
