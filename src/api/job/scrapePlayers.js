const send = require('src/server/utils/zeitSend');

import { gql } from '@apollo/client';
import { createQuery } from 'src/graphql/createQuery';
import parseMorgue from 'src/utils/parseMorgue';

// Example API Request
// http://localhost:3000/api/job/scrapePlayers

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
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < morgues.length; i++) {
    const morgue = morgues[i];
    const newMorgue = !morgueLookup[morgue.timestamp.getTime()];
    if (newMorgue) {
      asyncAddMorgues.push(addMorgue(player.id, morgue));
    }
  }

  await Promise.all(asyncAddMorgues);
  console.debug('[scrapePlayer]', 'asyncAddMorgues', asyncAddMorgues.length);
}

async function addMorgue(playerId, morgue) {
  const { url, timestamp } = morgue;

  // parse morgue
  const data = await parseMorgue(url);
  const { items, version, value: seed } = data;

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
      name: item.name,
      location: item.location,
      branch,
      seed,
      version,
    };
    if (level) {
      addItemVariables.level = parseInt(level, 10);
    }
    asyncAddItems.push(GQL_ADD_ITEM.run(addItemVariables));
  });

  // wait for all items to be added
  await Promise.all(asyncAddItems);

  // add morgue to indicate it has been parsed
  await GQL_ADD_MORGUE.run({ playerId, url, timestamp });
}

module.exports = async (req, res) => {
  try {
    // console.debug('[scrapePlayers]', 'start');

    const scrapePlayers = await GQL_SCRAPEPLAYERS.run();

    for (let i = 0; i < scrapePlayers.length; i++) {
      await scrapePlayer(scrapePlayers[i]);
    }

    // for one player
    // gather all morgue files
    // parse for particular version say 0.26 and 0.27 to start
    // run parseMorgue util or some variant to collect metadata
    // create a note row for every line in parsed metadata
    // id seed note location level
    // then we can search and discover seeds with interesting items

    // make recursive endpoint on dcsseeds dcss.now.sh
    // eg scrapePlayers
    // this will do below and keep things up to date and skip duplicates, can even store the last parsed entry date so we can only add new entries
    // this can constantly call itself every 30s or so to keep database warm and entries automatically up to date

    // can start with set of players and servers and expand
    // we can set a row for each player eg
    // id name server last updated active
    // active indicates whether to include them in the scrapePlayers recursive task
    // given a player name and server we should be able to discover all morgues
    // eg
    // http://crawl.akrasiac.org/scoring/overview.html

    // console.debug('[scrapePlayers]', 'end');

    return send(res, 200);
  } catch (err) {
    return send(res, 500, err);
  }
};

const GQL_SCRAPEPLAYERS = createQuery(
  gql`
    query ListScrapePlayers {
      scrapePlayers(order_by: { lastRun: asc_nulls_first }) {
        id
        lastRun
        name
        server
        morgues {
          timestamp
        }
      }
    }
  `,
  (data) => data.scrapePlayers,
);

const GQL_ADD_MORGUE = createQuery(
  gql`
    mutation AddMorgue($playerId: uuid!, $url: String!, $timestamp: timestamptz!) {
      insert_scrapePlayers_morgues(
        objects: { player: $playerId, url: $url, timestamp: $timestamp }
        on_conflict: { constraint: scrapePlayers_morgues_url_key, update_columns: updated }
      ) {
        affected_rows
      }
    }
  `,
);

const GQL_ADD_ITEM = createQuery(gql`
  mutation AddItem(
    $name: String!
    $location: String!
    $branch: String!
    $level: Int
    $seed: String!
    $version: String!
  ) {
    insert_scrapePlayers_items(
      objects: {
        name: $name
        locations: {
          data: {
            branch: $branch
            level: $level
            location: $location
            seed: {
              data: { value: $seed, version: $version }
              on_conflict: { constraint: scrapePlayers_seeds_version_value_key, update_columns: updated }
            }
          }
          on_conflict: { constraint: scrapePlayers_itemLocations_itemId_seedId_location_key, update_columns: updated }
        }
      }
      on_conflict: { constraint: scrapePlayers_items_item_key, update_columns: updated }
    ) {
      affected_rows
    }
  }
`);
