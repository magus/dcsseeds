import send from 'src/server/zeitSend';

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import { Stopwatch } from 'src/server/Stopwatch';

import { addMorgue } from './addMorgue';
import { fetch_morgue_list } from './fetch_morgue_list';
import { MAX_MORGUES_PER_PLAYER, MAX_ITERATIONS_PER_REQUEST } from './constants';

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

// set this to true to debug the flow and results
// of this api function without writing to database
const DEBUG = false;

export default async function scrapePlayers(req, res) {
  try {
    const stopwatch = new Stopwatch();

    const player_list = await stopwatch.time(GQL_SCRAPEPLAYERS.run()).record('fetch player list');

    const promise_result_list = player_list.map((player) => scrape_morgue_list({ player, stopwatch }));

    const result_list = await Promise.all(promise_result_list);

    const total_morgues = sum_list(result_list.map((result) => result.list.length));

    stopwatch.record(`total time`);
    const times = stopwatch.list();
    const data = { times, total_morgues, result_list };
    return send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return send(res, 500, err, { prettyPrint: true });
  }
}

// TODO, is there a way we can ABORT when we reach a certain time?
async function scrape_morgue_list({ player, stopwatch }) {
  const player_stopwatch = new Stopwatch();

  const player_id = player.id;
  const { name, server } = player;

  const result = {
    name,
    server,
    list: [],
    times: [],
  };

  function finish_result() {
    result.times = player_stopwatch.list();
    return result;
  }

  const maybe_morgue_list = await player_stopwatch
    .time(Promise.race([fetch_morgue_list(player), sleep_ms(5000)]))
    .record('fetch morgue list');

  if (!maybe_morgue_list) {
    // the 5s sleep finished before morgue fetch, abort this fetch
    await player_stopwatch
      .time(maybe_player_morgues({ player_id, morgue_map: {} }))
      .record('abort morgue list fetch, marking last run');

    return finish_result();
  }

  const { morgue_list, skip_morgue_set } = maybe_morgue_list;

  // console.debug();
  // console.debug(player.name, 'morgue_list', morgue_list.length, 'skip_morgue_set', skip_morgue_set.size);
  // console.debug(morgue_list[0], morgue_list[morgue_list.length - 1]);

  if (skip_morgue_set.size) {
    const morgue_map = {};

    for (const timestamp of skip_morgue_set) {
      morgue_map[timestamp] = true;
    }

    await player_stopwatch
      .time(maybe_player_morgues({ player_id, morgue_map }))
      .record(`skip ${skip_morgue_set.size} older morgues`);
  }

  for (const morgue of morgue_list) {
    if (stopwatch.elapsed_ms() >= 5000) {
      // console.debug('exiting', name, result.list.length);
      break;
    }

    const is_new = !player.morgues[morgue.timestamp];

    if (is_new) {
      const promise = maybe_addMorgue({ player, morgue });
      const morgue_result = await player_stopwatch.time(promise).record(morgue.url);

      result.list.push(morgue_result);
    }
  }

  if (result.list.length === 0) {
    await player_stopwatch
      .time(maybe_player_morgues({ player_id, morgue_map: {} }))
      .record('no new morgues, marking last run');
  }

  return finish_result();
}

async function maybe_addMorgue({ player, morgue }) {
  if (DEBUG) {
    await sleep_ms(Math.random() * 3000 + 2000);
    return [player.name, morgue.url];
  }

  return addMorgue({ player, morgue });
}

async function maybe_player_morgues(variables) {
  if (DEBUG) {
    await sleep_ms(Math.random() * 1000 + 400);
  }

  return GQL_PLAYER_MORGUES.run(variables);
}

function sleep_ms(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sum_list(list) {
  let sum = 0;
  for (const value of list) {
    sum += value;
  }
  return sum;
}

const GQL_SCRAPEPLAYERS = serverQuery(
  gql`
    query ListScrapePlayers {
      dcsseeds_scrapePlayers(limit: 15, order_by: { lastRun: asc_nulls_first }) {
        id
        name
        server
        morgues
      }
    }
  `,
  (data) => data.dcsseeds_scrapePlayers,
);

const GQL_PLAYER_MORGUES = serverQuery(
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
