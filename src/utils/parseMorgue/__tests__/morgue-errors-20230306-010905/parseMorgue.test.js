import { expect, test } from 'bun:test';

import { setup_test_parseMorgue } from '../test_parseMorgue';

test('failure fetching .lst file throws stash error', async () => {
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/errors/morgue-errors-20230306-010905.txt';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.lst = { ok: false, status: 500 };

  await expect(tester.run()).rejects.toThrow('stash status code [500]');
});

test('missing .lst file is skipped', async () => {
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/errors/morgue-errors-20230306-010905.txt';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.lst = { ok: false, status: 404 };

  const result = await tester.run();
  expect(result.value).toEqual('13998099872284306217');
  expect(result.events.length).toEqual(118);
  expect(result.stash).toEqual({
    artefact_list: [],
    branch: {},
    shop_list: [],
  });
});

test('failure parsing .lst file throws error', async () => {
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/errors/morgue-errors-20230306-010905.txt';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.lst = {
    ok: true,
    status: 200,
    arrayBuffer: async () => {
      throw new Error('ERROR response.arrayBuffer()');
    },
  };

  await expect(tester.run()).rejects.toThrow('ERROR response.arrayBuffer()');
});

test('empty response for both morgue and lst', async () => {
  // sometimes servers respond with a blank morgue file these fixtures simulate that
  const morgue_url = 'http://crawl.akrasiac.org/rawdata/errors/morgue-errors-20230306-010905.txt';
  const tester = setup_test_parseMorgue(morgue_url);

  tester.mocks.fetch.morgue = {
    ok: true,
    status: 200,
    text: async () => {
      return '';
    },
  };

  tester.mocks.fetch.lst = {
    ok: true,
    status: 200,
    arrayBuffer: () => {
      return [];
    },
  };

  await expect(tester.run()).rejects.toThrow('invalid morgue text when parsing version');
});
