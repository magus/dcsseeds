import { setup_test_parseMorgue } from './test_parseMorgue';

test('failure fetching .lst file does not interrupt morgue parsing', async () => {
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/kareem/morgue-kareem-20220818-224217.txt.gz';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.lst = { ok: false, status: 500 };

  await expect(() => tester.run()).rejects.toThrow('stash status code [500]');
});

test('failure parsing .lst file does not interrupt morgue parsing', async () => {
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/kareem/morgue-kareem-20220818-224217.txt.gz';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.lst = {
    ok: true,
    status: 200,
    arrayBuffer: () => {
      throw new Error('ERROR response.arrayBuffer()');
    },
  };

  await expect(() => tester.run()).rejects.toThrow('ERROR response.arrayBuffer()');
});

test('empty response for both morgue and lst', async () => {
  // sometimes servers respond with a blank morgue file these fixtures simulate that
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/notfound/morgue-notfound-20230306-010905.txt';
  const tester = setup_test_parseMorgue(morgue_url);
  await expect(() => tester.run()).rejects.toThrow('invalid morgue text when parsing version');
});
