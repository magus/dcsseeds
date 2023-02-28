// Link to all servers
// https://crawl.develz.org/play.htm
// Australia: https://crawl.project357.org/morgue/xoxohorses/morgue-xoxohorses-20210321-232315.txt
// Ohio: https://cbro.berotato.org/morgue/xoxohorses/morgue-xoxohorses-20210321-233134.txt
// - France (reference seed): no custom seed option
// - Germany: no custom seed option either
// - Korea: no custom seed option either
// - Japan: didn't load
// - New York: https://crawl.kelbi.org/crawl/morgue/MalcolmRose/morgue-MalcolmRose-20210116-054957.txt

function ServerConfig(rawdata_base) {
  return {
    rawdata_base,
    rawdataUrl: (name) => `${rawdata_base}/${name}/`,
    morgueRegex: (name) => new RegExp(`href=(?:\"|\').*?(morgue-${name}-([0-9\-]*?)\.txt(?:\.gz)?)(?:\"|\')`, 'g'),
  };
}

// http://crawl.akrasiac.org/scoring/per-day.html
// http://crawl.akrasiac.org/scoring/recent.html
// http://crawl.akrasiac.org/scoring/all-players.html

// maybe instead of parsing the server morgue lists directly
// parse the akrasiac listings above, which link out to individual morgue files
// this avoids the issue of handling each server and instead goes back
// to handling just morgue files, a player name is unique identifier across servers
export const SERVER_CONFIG = {
  akrasiac: new ServerConfig('http://crawl.akrasiac.org/rawdata'),
  xtahua: new ServerConfig('https://crawl.xtahua.com/crawl/morgue'),
  project357: new ServerConfig('https://crawl.project357.org/morgue'),
  berotato: new ServerConfig('https://cbro.berotato.org/morgue'),
  underhound: new ServerConfig('https://underhound.eu/crawl/morgue'),

  // problematic servers ...

  // kelbi has really long response times
  kelbi: new ServerConfig('https://crawl.kelbi.org/crawl/morgue'),
};
