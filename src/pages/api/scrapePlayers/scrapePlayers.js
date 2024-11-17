import send from 'src/server/zeitSend';

import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import { Stopwatch } from 'src/server/Stopwatch';
import { error_json } from 'src/utils/error_json';
import { Morgue } from 'src/utils/Morgue';

import { addMorgue } from './addMorgue';
import { fetch_morgue_list } from './fetch_morgue_list';
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

// set this to true to debug the flow and results
// of this api function without writing to database
const DEBUG = false;

const TIMEOUT_MS = 8000;
const ms_budget = (stopwatch) => TIMEOUT_MS - stopwatch.elapsed_ms();

export default async function scrapePlayers(req, res) {
  try {
    const stopwatch = new Stopwatch();

    const param_morgue = req.query.morgue;

    if (param_morgue) {
      // extract player name and server from morgue url
      const morgue = new Morgue(param_morgue);
      const name = morgue.player;
      const server = SERVER_CONFIG.morgue_server(param_morgue);

      const player = await stopwatch.time(GQL_FINDPLAYER.run({ name, server })).record('fetch player');

      const dry = true;

      const result = await stopwatch
        .time(maybe_addMorgue({ player, morgue, dry }))
        .timeout(ms_budget(stopwatch))
        .record(morgue.filename);

      stopwatch.record('total time');
      const times = stopwatch.list();
      return await send(res, 200, { param_morgue, server, morgue, times, result }, { prettyPrint: true });
    }

    // prettier-ignore
    // const player_list = await stopwatch.time(GQL_SCRAPEPLAYERS_BY_NAME.run({ name: 'svalbard' })).record('fetch player list');
    const player_list = await stopwatch.time(GQL_SCRAPEPLAYERS.run()).record('fetch player list');

    const promise_result_list = player_list.map((player) => {
      return scrape_morgue_list({ player, stopwatch });
    });

    const result_list = await Promise.all(promise_result_list);

    const total_morgues = sum_list(result_list.map((result) => result.list.length));

    stopwatch.record('total time');
    const times = stopwatch.list();
    const data = { times, total_morgues, result_list };
    return await send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return await send(res, 500, err, { prettyPrint: true });
  }
}

// TODO, is there a way we can ABORT when we reach a certain time?
async function scrape_morgue_list({ player, stopwatch }) {
  const player_stopwatch = new Stopwatch();
  player_stopwatch.record(`start=${stopwatch.elapsed_ms()}`);

  const player_id = player.id;
  const { name, server } = player;

  const result = {
    name,
    server,
    error: undefined,
    list: [],
    times: [],
  };

  try {
    const maybe_morgue_list = await player_stopwatch
      .time(fetch_morgue_list(player))
      .timeout(ms_budget(stopwatch))
      .record('fetch morgue list');

    if (!maybe_morgue_list) {
      // the 5s sleep finished before morgue fetch, abort this fetch
      throw new Error('abort morgue list fetch, marking last run');
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
      // this is important, ensures we don't keep calling with short timeouts
      if (ms_budget(stopwatch) < 1) {
        break;
      }

      const is_new = !player.morgues[morgue.timestamp];

      if (is_new) {
        const morgue_result = await player_stopwatch
          .time(maybe_addMorgue({ player, morgue }))
          .timeout(ms_budget(stopwatch))
          .record(morgue.filename);

        result.list.push(morgue_result);
      }
    }
  } catch (err) {
    switch (true) {
      case err instanceof Stopwatch.Error: {
        // stopwatch errors which are timeouts
        result.error = err.mesage;
        break;
      }

      default: {
        result.error = error_json(err);

        const error = `scrape_morgue_list(${player.name}) [${err.message}]`;
        const errors = [{ error }];
        await player_stopwatch.time(GQL_ADD_PARSE_ERROR.run({ errors })).record('top level error');
      }
    }
  }

  result.times = player_stopwatch.list();

  if (result.list.length === 0) {
    // no results, we must manually mark last run
    await player_stopwatch
      .time(maybe_player_morgues({ player_id, morgue_map: {} }))
      .record('no new morgues, marking last run');
  } else if (result.list.length && result.list.every((result) => result.status === 'error')) {
    // all errors, we must manually mark last run
    await player_stopwatch
      .time(maybe_player_morgues({ player_id, morgue_map: {} }))
      .record('all errors, marking last run');
  }

  return result;
}

const fake_ms = (at_least, delta) => at_least + Math.random() * delta;

async function maybe_addMorgue({ player, morgue, dry = false }) {
  if (DEBUG) {
    await sleep_ms(fake_ms(2000, 3000));
    return [player.name, morgue.url];
  }

  return addMorgue({ player, morgue, dry });
}

async function maybe_player_morgues(variables) {
  if (DEBUG) {
    return await sleep_ms(fake_ms(150, 850));
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

// this is optional to allow easily using above to run for specific player
// eslint-disable-next-line no-unused-vars
const GQL_SCRAPEPLAYERS_BY_NAME = serverQuery(
  gql`
    query ListScrapePlayers($name: String!) {
      dcsseeds_scrapePlayers(limit: 15, order_by: { lastRun: asc_nulls_first }, where: { name: { _eq: $name } }) {
        id
        name
        server
        morgues
      }
    }
  `,
  (data) => data.dcsseeds_scrapePlayers,
);

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

const GQL_FINDPLAYER = serverQuery(
  gql`
    query FindPlayerByNameServer($name: String!, $server: String!) {
      dcsseeds_scrapePlayers(where: { name: { _eq: $name }, server: { _eq: $server } }) {
        id
        name
        server
        morgues
      }
    }
  `,
  (data) => data.dcsseeds_scrapePlayers[0],
);

const GQL_PLAYER_MORGUES = serverQuery(gql`
  mutation AddMorgue($player_id: uuid!, $morgue_map: jsonb!) {
    update_dcsseeds_scrapePlayers(
      _append: { morgues: $morgue_map }
      where: { id: { _eq: $player_id } }
      _set: { lastRun: "now()" }
    ) {
      affected_rows
    }
  }
`);

const GQL_ADD_PARSE_ERROR = serverQuery(gql`
  mutation AddParseError($errors: [dcsseeds_scrapePlayers_errors_insert_input!]!) {
    insert_dcsseeds_scrapePlayers_errors(
      objects: $errors
      on_conflict: { constraint: dcsseeds_scrapePlayers_errors_error_morgue_turn_loc_note_key, update_columns: error }
    ) {
      affected_rows
    }
  }
`);
