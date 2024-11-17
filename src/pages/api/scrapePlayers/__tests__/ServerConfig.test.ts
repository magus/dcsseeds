import { expect, test } from 'bun:test';

import { SERVER_CONFIG } from '../ServerConfig';

const test_case_list = [
  ['crawl.akrasiac.org/rawdata/9to/morgue-9to-20221222-030513.txt', 'akrasiac'],
  ['crawl.xtahua.com/crawl/morgue/bananaglory/morgue-bananaglory-20230306-120305.txt', 'xtahua'],
  ['crawl.project357.org/morgue/Wombat/morgue-Wombat-20230303-100901.txt', 'project357'],
  ['cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20220415-040202.txt', 'berotato'],
  ['underhound.eu/crawl/morgue/GeoRichter/morgue-GeoRichter-20230306-214217.txt', 'underhound'],
  ['webzook.net/soup/morgue/0.28/dubedul/morgue-dubedul-20220206-084604.txt', 'webzook'],
  ['webzook.net/soup/morgue/trunk/dubedul/morgue-dubedul-20230220-122518.txt', 'webzook'],
  ['crawl.kelbi.org/crawl/morgue/TsoeiynMaft/morgue-TsoeiynMaft-20230301-012532.txt.gz', 'kelbi'],
  ['crawl.develz.org/morgues/git/svalbard/morgue-svalbard-20161108-120329.txt', 'develz'],
  ['crawl.develz.org/morgues/trunk/goupaloupa/morgue-goupaloupa-20240830-153100.txt', 'develztrunk'],
  ['crawl.dcss.io/crawl/morgue/Booper/morgue-Booper-20241015-181159.txt', 'crawldcssio'],
];

for (const test_case of test_case_list) {
  const [base_url, expected] = test_case;

  test(`SERVER_CONFIG.morgue_server(${base_url}) = ${expected}`, () => {
    const result = SERVER_CONFIG.morgue_server(base_url);
    expect(result).toBe(expected);
  });

  for (const scheme of ['http', 'https']) {
    const url = `${scheme}://${base_url}`;

    test(`SERVER_CONFIG.morgue_server(${url}) = ${expected}`, () => {
      const result = SERVER_CONFIG.morgue_server(url);
      expect(result).toBe(expected);
    });
  }
}
