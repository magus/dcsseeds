const send = require('src/server/zeitSend');

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';

import { Morgue } from 'src/server/Morgue';
import { addMorgue } from './addMorgue';
import { SERVER_CONFIG } from './ServerConfig';

// DCSS score overview with player morgues
// http://crawl.akrasiac.org/scoring/overview.html

// Delete everything to reparse
// mutation MyMutation {
//   update_dcsseeds_scrapePlayers(where: {name: {_neq: ""}}, _set: {morgues: {}}) {
//     affected_rows
//   }
//   delete_dcsseeds_scrapePlayers_item(where: {name: {_neq: ""}}) {
//     affected_rows
//   }
// }

// Find a specific seed that contains multiple specific items
// e.g. a 'shield' and 'amulet of the Four Winds'
// This pattern can be used to programmatically build up search strings to find very specific kinds of runs
// gql`
//   query MyQuery {
//     dcsseeds_scrapePlayers_seedVersion(
//       where: {
//         _and: [
//           { version: { _eq: "0.27.1" } }
//           { items: { name: { _ilike: "%four%" } } }
//           { items: { name: { _ilike: "%shield%" } } }
//         ]
//       }
//     ) {
//       items_aggregate {
//         aggregate {
//           count
//         }
//         nodes {
//           name
//           branchName
//           level
//         }
//       }
//     }
//   }
// `;

// Adjust this if you want to parse more morgues per request
const MAX_ITERATIONS_PER_REQUEST = 10;
const MAX_MORGUES_PER_PLAYER = 1;

// minimum version to allow parsing for
// 0.27.0 would allow everything above e.g. 0.27.1, 0.28.0, etc.
const MINIMUM_ALLOWED_VERSION = '0.27.1';

// date when minimum allowed version was released
// this can be used to skip morgues before min version
// e.g. https://github.com/crawl/crawl/tree/0.27.1
const MINIMUM_ALLOWED_DATE = new Date('2021-08-18');

async function scrape_morgue_list(player) {
  const serverConfig = SERVER_CONFIG[player.server];

  if (!serverConfig) {
    // throw new Error(`unrecognized server [${player.server}]`);
    console.error('scrape_morgue_list', 'unrecognized server', player.name, player.server);

    return [];
  }

  const rawdataUrl = serverConfig.rawdataUrl(player.name);
  const resp = await fetch(rawdataUrl);

  if (resp.status === 404) {
    console.error('scrape_morgue_list', '404', rawdataUrl);

    // Should we remove the player or something?
    // Maybe, it's fine for now, it will find 0 morgues anyway
    return [];
  }

  const morgue_list = [];
  const skip_morgue_set = new Set();

  const morgue_list_html = await resp.text();
  const regex = serverConfig.morgueRegex(player.name);

  let match;

  function next_match() {
    // move to next match
    match = regex.exec(morgue_list_html);
    return match;
  }

  // keep moving forward until we run out of matches
  // this will return null when we cycle at end of matches
  while (next_match()) {
    const [, filename, timeString] = match;
    const url = `${rawdataUrl}${filename}`;

    const morgue = new Morgue(url);

    // filter morgue before minimum allowed date
    if (morgue.date < MINIMUM_ALLOWED_DATE) {
      // if not already marked, add to skip morgue list
      if (!player.morgues[morgue.timestamp]) {
        skip_morgue_set.add(morgue.timestamp);
      }

      continue;
    }

    // if we got to this point, add this morgue to list
    morgue_list.push(morgue);
  }

  // reverse the list so that most recent (bottom) is first
  morgue_list.reverse();

  // show first and last morgue parsed from html page
  // console.debug(morgue_list[0], morgue_list[morgue_list.length - 1]);

  if (skip_morgue_set.size) {
    const morgue_map = {};

    for (const timestamp of skip_morgue_set) {
      morgue_map[timestamp] = true;
    }

    console.debug(player.name, skip_morgue_set.size, 'older morgues as skipped');
    const player_id = player.id;
    await GQL_ADD_MORGUE.run({ player_id, morgue_map });
  }

  return morgue_list;
}

async function parsePlayerMorgues({ player, morgues }) {
  const asyncAddMorgues = [];

  for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < 1; i++) {

    // skip if we have reached max morgues to parse per player
    if (asyncAddMorgues.length >= MAX_MORGUES_PER_PLAYER) break;

    const morgue = morgues[i];
    const newMorgue = !player.morgues[morgue.timestamp];
    if (newMorgue) {
      asyncAddMorgues.push(addMorgue({ player, morgue, MINIMUM_ALLOWED_VERSION }));
    }
  }

  const result = await Promise.all(asyncAddMorgues);

  if (!result.length) {
    // console.debug(player.name, player.server, 'no new morgues');
  }

  // console.debug('mark last run for', player.name, player.server);
  // await GQL_LAST_RUN_PLAYER.run({ playerId: player.id });

  // console.debug('[scrapePlayer]', 'asyncAddMorgues', asyncAddMorgues.length, { result });
  return result;
}

async function loopPlayerMorgues({ players, playerMorgues }) {
  if (players.length !== playerMorgues.length) {
    throw new Error('[loopPlayerMorgues] players and playerMorgues must be equal size');
  }

  const results = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const morgues = playerMorgues[i];
    results.push(parsePlayerMorgues({ player, morgues }));
  }

  return await Promise.all(results);
}

function getElapsedTime(start) {
  return Date.now() - start;
}

module.exports = async function scrapePlayers(req, res) {
  const reqStart = Date.now();

  try {
    // console.debug('[scrapePlayers]', 'start');
    const players = await GQL_SCRAPEPLAYERS.run();

    const promise_player_morgue_list = [];

    for (const player of players) {
      promise_player_morgue_list.push(scrape_morgue_list(player));
    }

    const playerMorgues = await Promise.all(promise_player_morgue_list);

    const loopResults = [];
    let iteration = 0;
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

    const time = getElapsedTime(reqStart);

    // console.debug('[scrapePlayers]', 'end');
    return send(res, 200, { time, iteration, loopResults }, { prettyPrint: true });
  } catch (err) {
    const time = getElapsedTime(reqStart);
    return send(res, 500, err, { prettyPrint: true });
  }
};

const GQL_SCRAPEPLAYERS = serverQuery(
  gql`
    query ListScrapePlayers {
      dcsseeds_scrapePlayers(order_by: { lastRun: asc_nulls_first }) {
        id
        lastRun
        name
        server
        morgues
      }
    }
  `,
  (data) => data.dcsseeds_scrapePlayers,
);

const GQL_ADD_MORGUE = serverQuery(
  gql`
    mutation AddMorgue($player_id: uuid!, $morgue_map: jsonb!) {
      update_dcsseeds_scrapePlayers(
        _append: { morgues: $morgue_map }
        where: { id: { _eq: $player_id } }
        _set: { lastRun: "now()" }
      ) {
        affected_rows
      }
    }
  `,
);
