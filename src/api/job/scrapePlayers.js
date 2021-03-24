const send = require('src/server/utils/zeitSend');

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import parseMorgue from 'src/utils/parseMorgue';

// DCSS score overview with player morgues
// http://crawl.akrasiac.org/scoring/overview.html

// Example API Request
// http://localhost:3000/api/job/scrapePlayers

// Delete all morgues (reparse)
// mutation MyMutation {
//   delete_scrapePlayers_morgues(where: {url: {_neq: ""}}) {
//     affected_rows
//   }
//   delete_scrapePlayers_items(where: {name: {_neq: ""}}) {
//     affected_rows
//   }
// }

// Distinct branch names (audit parseMorgues BRANCH_NAMES getBranch logic)
// query MyQuery {
//   scrapePlayers_itemLocations(distinct_on: branch) {
//     branch
//   }
// }

const SERVER_CONFIG = {
  akrasiac: {
    rawdataUrl: (name) => `http://crawl.akrasiac.org/rawdata/${name}`,
    // /href=\"(morgue-magusnn-[0-9\-]*\.txt)\"/g
    morgueRegex: (name) => `href=\"(morgue-${name}-([0-9\-]*)\.txt)\"`,
    morgueTimestampRegex: (timestamp) => {
      const [, Y, M, D, h, m, s] = /(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/.exec(timestamp);
      const dateString = `${Y}-${M}-${D}T${h}:${m}:${s}.000Z`;
      return new Date(dateString);
    },
  },
};

const PARSE_MORGUE_ITEM_TYPES = {
  item: true,
};

// Adjust this if you want to parse more morgues per request
const MAX_MORGUES_PER_PLAYER = 1;

async function scrapePlayer(player) {
  const morgues = await parsePlayer(player);
  await parsePlayerMorgues({ player, morgues, limit: 1 });

  return { morgues };
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

  const morgues = [];
  const regex = new RegExp(serverConfig.morgueRegex(name), 'g');
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

  const response = (status, extra) => {
    // mark morgue as visited
    player.morgues[morgue.timestamp.getTime()] = true;
    return { status, morgue: url, ...extra };
  };

  console.debug('[addMorgue]', url);

  try {
    // parse morgue
    const data = await parseMorgue(url);
    // console.debug('addMorge', { data });

    const { version, fullVersion, value } = data;

    // collect items to send in a single mutation call
    const items = [];

    data.items.forEach((item) => {
      // only allow certain parse morgue item types
      // e.g. type: 'item'
      if (!PARSE_MORGUE_ITEM_TYPES[item.type]) return;

      const { name, branch, level, location } = item;

      const insertItem = {
        name,
        locations: {
          data: {
            branch,
            location,
            morgue: {
              data: {
                playerId,
                url,
                timestamp,
                parsed: true,
              },
              on_conflict: { constraint: 'scrapePlayers_morgues_url_key', update_columns: 'updated' },
            },
            seed: {
              data: { value, version, fullVersion },
              on_conflict: { constraint: 'scrapePlayers_seeds_version_value_key', update_columns: 'updated' },
            },
          },
          on_conflict: {
            constraint: 'scrapePlayers_itemLocations_itemId_seedId_morgueId_location_key',
            update_columns: 'updated',
          },
        },
      };

      // optionally include level
      if (level) {
        insertItem.locations.data.level = parseInt(level, 10);
      }

      items.push(insertItem);
    });

    if (items.length) {
      await GQL_ADD_ITEM.run({ items });
      return response('done (items)');
    }

    // no items in this run, create a morgue so we do not search it again
    await GQL_ADD_MORGUE.run({
      playerId,
      url,
      timestamp,
    });
    return response('done (skip)');
  } catch (error) {
    console.error('[addMorgue]', 'error', { error });
    return response('error (morgue-url)', { error });
  }
}

async function loopPlayerMorgues({ players, playerMorgues, iteration }) {
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

module.exports = async function scrapePlayers(req, res) {
  try {
    // console.debug('[scrapePlayers]', 'start');
    const players = (await GQL_SCRAPEPLAYERS.run()).map((player) => {
      // rewrite morgues as a lookup for fast checks
      player.morgues = playerMorgueLookup(player.morgues);
      return player;
    });

    const scrapePlayerResults = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      console.debug('[scrapePlayers]', player.name);
      scrapePlayerResults.push(scrapePlayer(player));
    }

    const results = await Promise.all(scrapePlayerResults);
    const playerMorgues = results.map(({ morgues }) => morgues);

    const loopResult = await loopPlayerMorgues({ players, playerMorgues });

    // console.debug('[scrapePlayers]', 'end');
    return send(res, 200, { loopResult });
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
        morgues(where: { parsed: { _eq: true } }) {
          timestamp
        }
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
    mutation AddMorgue($playerId: uuid!, $url: String!, $timestamp: timestamptz!) {
      insert_scrapePlayers_morgues(
        objects: { playerId: $playerId, url: $url, timestamp: $timestamp, parsed: true }
        on_conflict: { constraint: scrapePlayers_morgues_url_key, update_columns: updated }
      ) {
        affected_rows
      }
    }
  `,
);

const GQL_ADD_ITEM = serverQuery(
  gql`
    mutation AddItem($items: [scrapePlayers_items_insert_input!]!) {
      item: insert_scrapePlayers_items(
        objects: $items
        on_conflict: { constraint: scrapePlayers_items_item_key, update_columns: updated }
      ) {
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
