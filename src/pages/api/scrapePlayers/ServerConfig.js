// Link to all servers
// https://crawl.develz.org/play.htm
// Australia: https://crawl.project357.org/morgue/xoxohorses/morgue-xoxohorses-20210321-232315.txt
// Ohio: https://cbro.berotato.org/morgue/xoxohorses/morgue-xoxohorses-20210321-233134.txt
// - France (reference seed): no custom seed option
// - Germany: no custom seed option either
// - Korea: no custom seed option either
// - Japan: didn't load
// - New York: https://crawl.kelbi.org/crawl/morgue/MalcolmRose/morgue-MalcolmRose-20210116-054957.txt

// http://crawl.akrasiac.org/scoring/per-day.html
// http://crawl.akrasiac.org/scoring/recent.html
// http://crawl.akrasiac.org/scoring/all-players.html

// maybe instead of parsing the server morgue lists directly
// parse the akrasiac listings above, which link out to individual morgue files
// this avoids the issue of handling each server and instead goes back
// to handling just morgue files, a player name is unique identifier across servers

//
// 🚨 IMPORTANT
// Must be kept in sync with database
// https://magic-graphql.iamnoah.com/console/data/default/schema/public/tables/dcsseeds_scrapePlayers_server/browse
//
const Server = Object.freeze({
  'akrasiac': 'akrasiac',
  'xtahua': 'xtahua',
  'project357': 'project357',
  'berotato': 'berotato',
  'underhound': 'underhound',
  'webzook': 'webzook',

  // kelbi has really long response times
  'kelbi': 'kelbi',

  // console players
  // https://www.reddit.com/r/dcss/comments/13aen1l/dcss_search_0300_update/jj6kyuw/
  'develz': 'develz',
  'develztrunk': 'develztrunk',

  'crawldcssio': 'crawldcssio',
});

export const SERVER_CONFIG = {};

for (const server of Object.keys(Server)) {
  SERVER_CONFIG[server] = new ServerConfig(server);
}

// determine server from morgue_url
SERVER_CONFIG.morgue_server = function morgue_server(morgue_url) {
  for (const server_name of Object.keys(Server)) {
    const config = SERVER_CONFIG[server_name];

    if (config.origin_re.test(morgue_url)) {
      return server_name;
    }
  }

  return null;
};

Object.freeze(SERVER_CONFIG);

function ServerConfig(server) {
  const url_base = (function () {
    switch (server) {
      case Server.akrasiac:
        return 'crawl.akrasiac.org/rawdata';
      case Server.xtahua:
        return 'crawl.xtahua.com/crawl/morgue';
      case Server.project357:
        return 'crawl.project357.org/morgue';
      case Server.berotato:
        return 'cbro.berotato.org/morgue';
      case Server.underhound:
        return 'underhound.eu/crawl/morgue';
      case Server.kelbi:
        return 'crawl.kelbi.org/crawl/morgue';
      case Server.webzook:
        return 'webzook.net/soup/morgue';
      case Server.develz:
        return 'crawl.develz.org/morgues/git';
      case Server.develztrunk:
        return 'crawl.develz.org/morgues/trunk';
      case Server.crawldcssio:
        return 'crawl.dcss.io/crawl/morgue';

      default:
        throw new Error(`ServerConfig base url missing for [${server}]`);
    }
  })();

  const origin_re = new RegExp(
    (function () {
      switch (server) {
        case Server.akrasiac:
        case Server.xtahua:
        case Server.project357:
        case Server.berotato:
        case Server.underhound:
        case Server.kelbi:
        case Server.webzook:
        case Server.develz:
        case Server.develztrunk:
        case Server.crawldcssio:
          return `^(https?://)?${url_base}`;

        default:
          throw new Error(`ServerConfig origin regex missing for [${server}]`);
      }
    })(),
  );

  function morgue_list_url_list(player_name, version_list) {
    const url_set = new Set();

    for (const version of version_list) {
      url_set.add(morgue_list_url(player_name, version));
    }

    return Array.from(url_set);
  }

  function morgue_list_url(player_name, version) {
    // webzook has version specific morgue listing
    if (server === Server.webzook) {
      // e.g. https://webzook.net/soup/morgue/0.29/Coo1/
      return `https://${url_base}/${version}/${player_name}/`;
    }

    return `https://${url_base}/${player_name}/`;
  }

  function player_morgue_regex(player_name) {
    return new RegExp(
      `href=(?:"|').*?(?<filename>(?<basename>morgue-${player_name}-([0-9-]*?)).txt(?:.gz)?)(?:"|')`,
      'g',
    );
  }

  return {
    server,
    origin_re,
    url_base,
    morgue_list_url_list,
    player_morgue_regex,
  };
}
