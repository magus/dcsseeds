import { expect, test } from '@jest/globals';

import { Morgue } from './Morgue';

test('invalid url throws clear error', () => {
  expect(() => Morgue('https://crawl.com')).toThrow(new Error('Morgue URL must match filename pattern'));
});

test('invalid timestamp throws clear error', () => {
  expect(() => Morgue('http://crawl.akrasiac.org/rawdata/Lemuel/morgue-Lemuel-2007-12.txt')).toThrow(
    new Error('Morgue URL must match timestamp pattern'),
  );
});

test.each([
  [
    'http://crawl.akrasiac.org/rawdata/Lemuel/morgue-Lemuel-20070301-1552.txt',
    {
      'date': new Date('2007-03-01T15:52:00.000Z'),
      'basename': 'morgue-Lemuel-20070301-1552',
      'filename': 'morgue-Lemuel-20070301-1552.txt',
      'player': 'Lemuel',
      'timestamp': '1172764320000',
      'url': 'http://crawl.akrasiac.org/rawdata/Lemuel/morgue-Lemuel-20070301-1552.txt',
    },
  ],
  [
    'http://crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt',
    {
      'date': new Date('2022-12-22T03:05:13.000Z'),
      'basename': 'morgue-9to-20221222-030513',
      'filename': 'morgue-9to-20221222-030513.txt',
      'player': '9to',
      'timestamp': '1671678313000',
      'url': 'http://crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt',
    },
  ],
  [
    'https://crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20230306-120305.txt',
    {
      'date': new Date('2023-03-06T12:03:05.000Z'),
      'basename': 'morgue-bananaglory-20230306-120305',
      'filename': 'morgue-bananaglory-20230306-120305.txt',
      'player': 'bananaglory',
      'timestamp': '1678104185000',
      'url': 'https://crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20230306-120305.txt',
    },
  ],
  [
    'https://crawl.project357.org/morgue/Wombat/morgue-Wombat-20230303-100901.txt',
    {
      'date': new Date('2023-03-03T10:09:01.000Z'),
      'basename': 'morgue-Wombat-20230303-100901',
      'filename': 'morgue-Wombat-20230303-100901.txt',
      'player': 'Wombat',
      'timestamp': '1677838141000',
      'url': 'https://crawl.project357.org/morgue/Wombat/morgue-Wombat-20230303-100901.txt',
    },
  ],
  [
    'https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt',
    {
      'date': new Date('2022-04-15T04:02:02.000Z'),
      'basename': 'morgue-Jingleheimer-20220415-040202',
      'filename': 'morgue-Jingleheimer-20220415-040202.txt',
      'player': 'Jingleheimer',
      'timestamp': '1649995322000',
      'url': 'https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt',
    },
  ],
  [
    'https://underhound.eu/crawl/morgue/GeoRichter/morgue-GeoRichter-20230306-214217.txt',
    {
      'date': new Date('2023-03-06T21:42:17.000Z'),
      'basename': 'morgue-GeoRichter-20230306-214217',
      'filename': 'morgue-GeoRichter-20230306-214217.txt',
      'player': 'GeoRichter',
      'timestamp': '1678138937000',
      'url': 'https://underhound.eu/crawl/morgue/GeoRichter/morgue-GeoRichter-20230306-214217.txt',
    },
  ],
  [
    'https://webzook.net/soup/morgue/0.28/dubedul/morgue-dubedul-20220206-084604.txt',
    {
      'date': new Date('2022-02-06T08:46:04.000Z'),
      'basename': 'morgue-dubedul-20220206-084604',
      'filename': 'morgue-dubedul-20220206-084604.txt',
      'player': 'dubedul',
      'timestamp': '1644137164000',
      'url': 'https://webzook.net/soup/morgue/0.28/dubedul/morgue-dubedul-20220206-084604.txt',
    },
  ],
  [
    'http://crawl.kelbi.org/crawl/morgue/RoGGa/morgue-RoGGa-20230306-191854.txt',
    {
      'date': new Date('2023-03-06T19:18:54.000Z'),
      'basename': 'morgue-RoGGa-20230306-191854',
      'filename': 'morgue-RoGGa-20230306-191854.txt',
      'player': 'RoGGa',
      'timestamp': '1678130334000',
      'url': 'http://crawl.kelbi.org/crawl/morgue/RoGGa/morgue-RoGGa-20230306-191854.txt',
    },
  ],
  [
    'https://crawl.kelbi.org/crawl/morgue/TsoeiynMaft/morgue-TsoeiynMaft-20230301-012532.txt.gz',
    {
      'date': new Date('2023-03-01T01:25:32.000Z'),
      'basename': 'morgue-TsoeiynMaft-20230301-012532',
      'filename': 'morgue-TsoeiynMaft-20230301-012532.txt.gz',
      'player': 'TsoeiynMaft',
      'timestamp': '1677633932000',
      'url': 'https://crawl.kelbi.org/crawl/morgue/TsoeiynMaft/morgue-TsoeiynMaft-20230301-012532.txt.gz',
    },
  ],
])('SERVER_CONFIG.morgue_server(%s)', (url, expected) => {
  expect(Morgue(url)).toEqual(expected);
});
