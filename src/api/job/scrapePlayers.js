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
const MAX_MORGUES_PER_PLAYER = 100;

function playerMorgueLookup(playerMorgues) {
  const lookup = {};
  for (let i = 0; i < playerMorgues.length; i++) {
    const timestamp = new Date(playerMorgues[i].timestamp).getTime();
    lookup[timestamp] = true;
  }
  return lookup;
}

async function scrapePlayer(player) {
  let resp;

  const { name } = player;
  const serverConfig = SERVER_CONFIG[player.server];
  const morgueLookup = playerMorgueLookup(player.morgues);

  const rawdataUrl = serverConfig.rawdataUrl(name);
  resp = await fetch(`${rawdataUrl}?C=M;O=D`);

  if (resp.status === 404) {
    console.debug('[scrapePlayer]', '404', name);
    // Should we remove the player or something?
    // Maybe, it's fine for now, it will find 0 morgues anyway
    return;
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

  const asyncAddMorgues = [];
  for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < 1; i++) {

    // skip if we have reached max morgues to parse per player
    if (asyncAddMorgues.length >= MAX_MORGUES_PER_PLAYER) break;

    const morgue = morgues[i];
    const newMorgue = !morgueLookup[morgue.timestamp.getTime()];
    if (newMorgue) {
      asyncAddMorgues.push(addMorgue(player.id, morgue));
    }
  }

  await Promise.all(asyncAddMorgues);
  await GQL_LAST_RUN_PLAYER.run({ playerId: player.id });
  console.debug('[scrapePlayer]', 'asyncAddMorgues', asyncAddMorgues.length);
}

async function addMorgue(playerId, morgue) {
  const { url, timestamp } = morgue;

  // parse morgue
  const data = await parseMorgue(url);

  // console.debug('addMorge', { data });

  if (data instanceof Error) {
    console.error('[addMorgue]', 'error', { data });
    return data;
  }

  const { items, version, fullVersion, value: seed } = data;

  // async mutations to add items
  const asyncAddItems = [];
  // console.debug('[scrapePlayer]', timestamp, { version, seed });
  items.forEach((item) => {
    // only allow certain parse morgue item types
    // e.g. type: 'item'
    if (!PARSE_MORGUE_ITEM_TYPES[item.type]) return;

    // console.debug('[scrapePlayer]', timestamp, { item });
    const [branch, level] = item.location.split(':');
    const addItemVariables = {
      // morgue
      playerId,
      url,
      timestamp,
      // item
      name: item.name,
      // itemLocation
      location: item.location,
      branch,
      // seed
      seed,
      version,
      fullVersion,
    };
    if (level) {
      addItemVariables.level = parseInt(level, 10);
    }
    asyncAddItems.push(GQL_ADD_ITEM.run(addItemVariables));
  });

  if (asyncAddItems.length) {
    // wait for all items to be added
    const resolvedLocations = await Promise.all(asyncAddItems);

    // pull off first result to get location.morgue.id or matching morgue
    const [locations] = resolvedLocations;
    let morgueId;
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      if (location.morgue.url === url) {
        morgueId = location.morgue.id;
        break;
      }
    }

    // add morgue to indicate it has been parsed
    await GQL_PARSED_MORGUE.run({ morgueId });
  } else {
    // no items in this run, create a morgue so we do not search it again
    console.debug('[addMorgue]', 'no items, creating morgue to skip in future');
    await GQL_ADD_MORGUE.run({
      playerId,
      url,
      timestamp,
    });
  }
}

module.exports = async (req, res) => {
  try {
    // console.debug('[scrapePlayers]', 'start');
    const scrapePlayers = await GQL_SCRAPEPLAYERS.run();

    for (let i = 0; i < scrapePlayers.length; i++) {
      await scrapePlayer(scrapePlayers[i]);
    }

    // console.debug('[scrapePlayers]', 'end');
    return send(res, 200);
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
      insert_scrapePlayers_morgues(objects: { playerId: $playerId, url: $url, timestamp: $timestamp, parsed: true }) {
        affected_rows
      }
    }
  `,
);

const GQL_PARSED_MORGUE = serverQuery(
  gql`
    mutation ParsedMorgue($morgueId: uuid!) {
      update_scrapePlayers_morgues_by_pk(pk_columns: { id: $morgueId }, _set: { parsed: true }) {
        id
      }
    }
  `,
);

const GQL_ADD_ITEM = serverQuery(
  gql`
    mutation AddItem(
      $playerId: uuid!
      $url: String!
      $timestamp: timestamptz!
      $name: String!
      $location: String!
      $branch: String!
      $level: Int
      $seed: String!
      $version: String!
      $fullVersion: String!
    ) {
      item: insert_scrapePlayers_items(
        objects: {
          name: $name
          locations: {
            data: {
              branch: $branch
              level: $level
              location: $location
              morgue: {
                data: { playerId: $playerId, url: $url, timestamp: $timestamp }
                on_conflict: { constraint: scrapePlayers_morgues_url_key, update_columns: updated }
              }
              seed: {
                data: { value: $seed, version: $version, fullVersion: $fullVersion }
                on_conflict: { constraint: scrapePlayers_seeds_version_value_key, update_columns: updated }
              }
            }
            on_conflict: {
              constraint: scrapePlayers_itemLocations_itemId_seedId_morgueId_location_key
              update_columns: updated
            }
          }
        }
        on_conflict: { constraint: scrapePlayers_items_item_key, update_columns: updated }
      ) {
        returning {
          locations {
            morgue {
              id
              url
            }
          }
        }
      }
    }
  `,
  // {
  //   "data": {
  //     "item": {
  //       "returning": [
  //         {
  //           "locations": [{ id: 'abc', url: 'http://blah.com' }]
  //         }
  //       ]
  //     }
  //   }
  // }
  (data) => {
    const [item] = data.item.returning;
    return item.locations;
  },
);
