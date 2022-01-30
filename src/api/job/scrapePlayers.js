const send = require('src/server/utils/zeitSend');

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import parseMorgue from 'src/utils/parseMorgue';

// DCSS score overview with player morgues
// http://crawl.akrasiac.org/scoring/overview.html

// Delete everything to reparse
// mutation MyMutation {
//   update_scrapePlayers(where: {name: {_neq: ""}}, _set: {morgues: {}}) {
//     affected_rows
//   }
//   delete_scrapePlayers_item(where: {name: {_neq: ""}}) {
//     affected_rows
//   }
// }

// Distinct branch names (audit parseMorgues BRANCH_NAMES getBranch logic)
// query MyQuery {
//   scrapePlayers_item(distinct_on: branch) {
//     branch
//   }
// }

// prettier-ignore
const ALLOWED_VERSIONS = {
  // '0.26': true,
  '0.27': true,
};

// Adjust this if you want to parse more morgues per request
const MAX_ITERATIONS_PER_REQUEST = 10;
const MAX_MORGUES_PER_PLAYER = 1;

// utils/parseMorgue item types (first string arg to createItem)
const PARSE_MORGUE_ITEM_TYPES = {
  item: true,
};

// Link to all servers
// https://crawl.develz.org/play.htm
// Australia: https://crawl.project357.org/morgue/xoxohorses/morgue-xoxohorses-20210321-232315.txt
// Ohio: https://cbro.berotato.org/morgue/xoxohorses/morgue-xoxohorses-20210321-233134.txt
// - France (reference seed): no custom seed option
// - Germany: no custom seed option either
// - Korea: no custom seed option either
// - Japan: didn't load
// - New York: https://crawl.kelbi.org/crawl/morgue/MalcolmRose/morgue-MalcolmRose-20210116-054957.txt
const SERVER_CONFIG = {
  akrasiac: {
    rawdataUrl: (name) => `http://crawl.akrasiac.org/rawdata/${name}`,
    morgueRegex: (name) => new RegExp(`href=(?:\"|\').*?(morgue-${name}-([0-9\-]*?)\.txt(?:\.gz)?)(?:\"|\')`, 'g'),
    morgueTimestampRegex: (timestamp) => {
      const [, Y, M, D, h, m, s] = /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(timestamp);
      const dateString = `${Y}-${M}-${D}T${h}:${m}:${s}.000Z`;
      return new Date(dateString);
    },
  },
  kelbi: {
    rawdataUrl: (name) => `https://crawl.kelbi.org/crawl/morgue/${name}`,
    morgueRegex: (name) => new RegExp(`href=(?:\"|\').*?(morgue-${name}-([0-9\-]*?)\.txt(?:\.gz)?)(?:\"|\')`, 'g'),
    morgueTimestampRegex: (timestamp) => {
      const [, Y, M, D, h, m, s] = /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(timestamp);
      const dateString = `${Y}-${M}-${D}T${h}:${m}:${s}.000Z`;
      return new Date(dateString);
    },
  },
};

async function scrapePlayer(player) {
  const morgues = await parsePlayer(player);
  // console.debug({ morgues });
  const result = await parsePlayerMorgues({ player, morgues, limit: 1 });

  return { morgues, result };
}

async function parsePlayer(player) {
  let resp;

  const { name } = player;
  const serverConfig = SERVER_CONFIG[player.server];

  const rawdataUrl = serverConfig.rawdataUrl(name);
  resp = await fetch(`${rawdataUrl}?C=M;O=D`);

  if (resp.status === 404) {
    console.debug('[scrapePlayer]', '404', name);
    // Should we remove the player or something?
    // Maybe, it's fine for now, it will find 0 morgues anyway
    return null;
  }

  const rawdataMorgueHtml = await resp.text();

  // if (player.name === 'MalcolmRose') {
  //   console.debug({ rawdataMorgueHtml });
  // }

  const morgues = [];
  const regex = serverConfig.morgueRegex(name);
  let match = regex.exec(rawdataMorgueHtml);
  while (match) {
    const [, filename, timeString] = match;
    const timestamp = serverConfig.morgueTimestampRegex(timeString);
    const url = `${rawdataUrl}/${filename}`;
    morgues.push({ url, timestamp });
    match = regex.exec(rawdataMorgueHtml);
  }

  return morgues;
}

async function parsePlayerMorgues({ player, morgues, limit = MAX_MORGUES_PER_PLAYER }) {
  const asyncAddMorgues = [];
  for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < 1; i++) {

    // skip if we have reached max morgues to parse per player
    if (asyncAddMorgues.length >= limit) break;

    const morgue = morgues[i];
    const newMorgue = !player.morgues[morgueLookupKey(morgue.timestamp)];
    if (newMorgue) {
      asyncAddMorgues.push(addMorgue({ player, morgue }));
    }
  }

  const result = await Promise.all(asyncAddMorgues);
  await GQL_LAST_RUN_PLAYER.run({ playerId: player.id });
  // console.debug('[scrapePlayer]', 'asyncAddMorgues', asyncAddMorgues.length, { result });
  return result;
}

async function addMorgue({ player, morgue }) {
  const playerId = player.id;
  const { url, timestamp } = morgue;

  function response(status, extra) {
    // mark morgue as visited
    player.morgues[morgueLookupKey(morgue.timestamp)] = true;
    return { status, morgue: url, ...extra };
  }

  async function skip(reason) {
    // used for errors and empty runs (no items)
    // create a morgue entry in scrapePlayers for this player morgue, so we do not search it again
    await GQL_ADD_MORGUE.run({
      playerId,
      data: { [morgueLookupKey(morgue.timestamp)]: true },
    });
    return response(`skip (${reason})`);
  }

  console.debug('[addMorgue]', url);

  try {
    // parse morgue
    const data = await parseMorgue(url);
    // console.debug('addMorge', { data });

    const { version, fullVersion, value: seed } = data;

    // skip if not allowed version
    if (!ALLOWED_VERSIONS[version]) {
      return skip(`not allowed version [${version}]`);
    }

    // collect items to send in a single mutation call
    const items = [];

    data.events.forEach((item) => {
      // only allow certain parse morgue item types
      // e.g. type: 'item'
      if (!PARSE_MORGUE_ITEM_TYPES[item.type]) return;

      const { name, level, location } = item;

      // creates and associate item.branch to new scrapePlayers_branch if needed
      const branch = {
        data: { name: item.branch },
        on_conflict: { constraint: 'scrapePlayers_branch_pkey', update_columns: 'name' },
      };

      const insertItem = {
        name,
        branch,
        location,
        morgue: url,
        playerId,
        timestamp,
        seed,
        version,
        fullVersion,
      };

      // optionally include level
      if (level) {
        insertItem.level = parseInt(level, 10);
      }

      items.push(insertItem);
    });

    if (items.length) {
      await GQL_ADD_ITEM.run({
        items,
        playerId,
        data: { [morgueLookupKey(morgue.timestamp)]: true },
      });
      return response('done (items)');
    }

    return skip('empty');
  } catch (error) {
    return skip(`[error] ${error.message}`);
  }
}

async function loopPlayerMorgues({ players, playerMorgues }) {
  if (players.length !== playerMorgues.length) {
    throw new Error('[loopPlayerMorgues] players and playerMorgues must be equal size');
  }

  const results = [];
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const morgues = playerMorgues[i];
    results.push(parsePlayerMorgues({ player, morgues, limit: 1 }));
  }

  return await Promise.all(results);
}

function getElapsedTime(start) {
  return Date.now() - start;
}

module.exports = async function scrapePlayers(req, res) {
  try {
    const reqStart = Date.now();

    // console.debug('[scrapePlayers]', 'start');
    const players = await GQL_SCRAPEPLAYERS.run();

    const scrapePlayerResults = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.debug('[scrapePlayers]', player.name);
      scrapePlayerResults.push(scrapePlayer(player));
    }

    const awaitedScrapePlayerResults = await Promise.all(scrapePlayerResults);
    const scrapeResults = awaitedScrapePlayerResults.map(({ result }) => result);
    const playerMorgues = awaitedScrapePlayerResults.map(({ morgues }) => morgues);

    const loopResults = [];
    let iteration = 1;
    while (getElapsedTime(reqStart) < 8000 && iteration < MAX_ITERATIONS_PER_REQUEST) {
      iteration++;
      const results = await loopPlayerMorgues({ players, playerMorgues });
      loopResults.push({ iteration, results });
      if (results.every((r) => r.length === 0)) {
        // every result is empty, no more runs to parse
        // exit early
        break;
      }
    }

    // console.debug('[scrapePlayers]', 'end');
    return send(res, 200, { iteration, scrapeResults, loopResults });
  } catch (err) {
    return send(res, 500, err);
  }
};

const GQL_SCRAPEPLAYERS = serverQuery(
  gql`
    query ListScrapePlayers {
      scrapePlayers(order_by: { lastRun: asc_nulls_first }) {
        id
        lastRun
        name
        server
        morgues
      }
    }
  `,
  (data) => data.scrapePlayers,
);

const GQL_LAST_RUN_PLAYER = serverQuery(gql`
  mutation LastRunPlayer($playerId: uuid!) {
    update_scrapePlayers_by_pk(pk_columns: { id: $playerId }, _set: { lastRun: "now()" }) {
      id
    }
  }
`);

const GQL_ADD_MORGUE = serverQuery(
  gql`
    mutation AddMorgue($playerId: uuid!, $data: jsonb!) {
      update_scrapePlayers(_append: { morgues: $data }, where: { id: { _eq: $playerId } }) {
        affected_rows
      }
    }
  `,
);

const GQL_ADD_ITEM = serverQuery(
  gql`
    mutation AddItem($playerId: uuid!, $data: jsonb!, $items: [scrapePlayers_item_insert_input!]!) {
      update_scrapePlayers(_append: { morgues: $data }, where: { id: { _eq: $playerId } }) {
        affected_rows
      }

      items: insert_scrapePlayers_item(objects: $items) {
        affected_rows
      }
    }
  `,
);

function morgueLookupKey(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.getTime();
}

function playerMorgueLookup(playerMorgues) {
  const lookup = {};
  for (let i = 0; i < playerMorgues.length; i++) {
    const morgue = playerMorgues[i];
    lookup[morgueLookupKey(morgue.timestamp)] = true;
  }
  return lookup;
}
