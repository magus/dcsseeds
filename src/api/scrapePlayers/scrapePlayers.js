const send = require('src/server/zeitSend');

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';

import { Morgue } from './Morgue';
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

  if (!serverConfig) {
    // throw new Error(`unrecognized server [${player.server}]`);
    console.error('[scrapePlayer]', 'unrecognized server', { player });

    return [];
  }

  const rawdataUrl = serverConfig.rawdataUrl(name);
  resp = await fetch(rawdataUrl);

  if (resp.status === 404) {
    console.error('[scrapePlayer]', '404', rawdataUrl);

    // Should we remove the player or something?
    // Maybe, it's fine for now, it will find 0 morgues anyway
    return [];
  }

  const morgue_list_html = await resp.text();

  // if (player.name === 'MalcolmRose') {
  //   console.debug({ morgue_list_html });
  // }

  const morgue_list = [];
  const regex = serverConfig.morgueRegex(name);
  let match = regex.exec(morgue_list_html);
  while (match) {
    const [, filename, timeString] = match;
    const url = `${rawdataUrl}${filename}`;

    morgue_list.push(new Morgue(url));

    // move to next match
    match = regex.exec(morgue_list_html);
  }

  // reverse the list so that most recent (bottom) is first
  morgue_list.reverse();

  // show first and last morgue parsed from html page
  // console.debug(morgue_list[0], morgue_list[morgue_list.length - 1]);

  return morgue_list;
}

async function parsePlayerMorgues({ player, morgues, limit = MAX_MORGUES_PER_PLAYER }) {
  const asyncAddMorgues = [];
  for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < morgues.length; i++) {
    // for (let i = 0; i < 1; i++) {

    // skip if we have reached max morgues to parse per player
    if (asyncAddMorgues.length >= limit) break;

    const morgue = morgues[i];
    const newMorgue = !player.morgues[morgue.timestamp];
    if (newMorgue) {
      asyncAddMorgues.push(addMorgue({ player, morgue }));
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
    results.push(parsePlayerMorgues({ player, morgues, limit: 1 }));
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

    const scrapePlayerResults = [];
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      scrapePlayerResults.push(scrapePlayer(player));
    }

    const awaitedScrapePlayerResults = await Promise.all(scrapePlayerResults);
    const scrapeResults = awaitedScrapePlayerResults.map(({ result }) => result);
    const playerMorgues = awaitedScrapePlayerResults.map(({ morgues }) => morgues);

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
    return send(res, 200, { time, iteration, scrapeResults, loopResults }, { prettyPrint: true });
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
