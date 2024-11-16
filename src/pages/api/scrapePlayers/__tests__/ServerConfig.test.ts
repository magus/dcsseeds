import { expect, test } from 'bun:test';

import { SERVER_CONFIG } from '../ServerConfig';

const test_case_list = [
  ['http://crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt', 'akrasiac'],
  ['https://crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt', null],
  ['', null],
  ['http://crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20230306-120305.txt', null],
  ['https://crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20230306-120305.txt', 'xtahua'],
  ['', null],
  ['http://crawl.project357.org/morgue/Wombat/morgue-Wombat-20230303-100901.txt', null],
  ['https://crawl.project357.org/morgue/Wombat/morgue-Wombat-20230303-100901.txt', 'project357'],
  ['', null],
  ['http://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt', null],
  ['https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt', 'berotato'],
  ['', null],
  ['http://underhound.eu/crawl/morgue/GeoRichter/morgue-GeoRichter-20230306-214217.txt', null],
  ['https://underhound.eu/crawl/morgue/GeoRichter/morgue-GeoRichter-20230306-214217.txt', 'underhound'],
  ['', null],
  ['http://webzook.net/soup/morgue/0.28/dubedul/morgue-dubedul-20220206-084604.txt', null],
  ['https://webzook.net/soup/morgue/0.28/dubedul/morgue-dubedul-20220206-084604.txt', 'webzook'],
  ['https://webzook.net/soup/morgue/trunk/dubedul/morgue-dubedul-20230220-122518.txt', 'webzook'],
  ['', null],
  ['http://crawl.kelbi.org/crawl/morgue/RoGGa/morgue-RoGGa-20230306-191854.txt', null],
  ['https://crawl.kelbi.org/crawl/morgue/TsoeiynMaft/morgue-TsoeiynMaft-20230301-012532.txt.gz', 'kelbi'],
  ['', null],
  ['http://crawl.develz.org/morgues/git/svalbard/morgue-svalbard-20161108-120329.txt', null],
  ['https://crawl.develz.org/morgues/git/svalbard/morgue-svalbard-20161108-120329.txt', 'develz'],
];

for (const test_case of test_case_list) {
  const [url, expected] = test_case;

  test(`SERVER_CONFIG.morgue_server(${url}) = ${expected}`, () => {
    const result = SERVER_CONFIG.morgue_server(url);
    expect(result).toBe(expected);
  });
}
