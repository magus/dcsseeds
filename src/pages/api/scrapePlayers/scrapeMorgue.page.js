import { gql } from '@apollo/client';

import send from 'src/server/zeitSend';
import { serverQuery } from 'src/graphql/serverQuery';
import { Stopwatch } from 'src/server/Stopwatch';
import { Morgue } from 'src/utils/Morgue';

import { SERVER_CONFIG } from './ServerConfig';
import { addMorgue } from './addMorgue';

// force scrape a morgue file, storing results in scrapePlayers_item
// http://localhost:3000/api/scrapePlayers/scrapeMorgue?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230114-084156.txt

// items            http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-012223.txt
// no items (skip)  http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-011455.txt
// error            http://crawl.akrasiac.org/rawdata/magusnn/

export default async function handler(req, res) {
  const stopwatch = new Stopwatch();

  const morgue_url = req.query.morgue;

  try {
    if (!morgue_url) {
      throw new Error('Must provide [morgue]');
    }

    const morgue = new Morgue(morgue_url);

    // determine server from morgue_url
    const server = SERVER_CONFIG.morgue_server(morgue_url);

    if (!server) {
      throw new Error('server not recognized');
    }

    // clear all items from any previous scrapes
    const cleared_items = await GQL_ClearMorgueItems.run({ morgue_url });
    stopwatch.record('clear previous items');

    // get player or create if it does not exist
    const name = morgue.player;
    const player = await GQL_UpsertPlayer.run({ name, server });
    stopwatch.record('upsert player');

    // parse and add the morgue items
    const response = await addMorgue({ player, morgue });
    stopwatch.record('add morgue items');

    // ensure error response treated as error
    const status_code = response.status === 'error' ? 500 : 200;

    const times = stopwatch.list();
    const data = { times, morgue, cleared_items, response };
    return send(res, status_code, data, { prettyPrint: true });
  } catch (err) {
    // immediate response
    send(res, 500, err, { prettyPrint: true });

    // track this error remotely
    if (!__DEV__) {
      const error_message = err.message || '__unknown__';
      GQL_TrackError.run({ error_message, morgue_url });
    }
  }
}

const GQL_ClearMorgueItems = serverQuery(
  gql`
    mutation ClearMorgueItems($morgue_url: String!) {
      item: delete_dcsseeds_scrapePlayers_item(where: { morgue: { _eq: $morgue_url } }) {
        affected_rows
      }
    }
  `,
  (data) => data.item.affected_rows,
);

const GQL_UpsertPlayer = serverQuery(
  gql`
    mutation UpsertPlayer($name: String!, $server: String!) {
      insert_dcsseeds_scrapePlayers(
        objects: { name: $name, server: $server }
        on_conflict: { constraint: dcsseeds_scrapePlayers_name_server_key, update_columns: name }
      ) {
        affected_rows
        returning {
          id
          name
          server
          morgues
        }
      }
    }
  `,
  (data) => {
    const [player] = data.insert_dcsseeds_scrapePlayers.returning;
    return player;
  },
);

const GQL_TrackError = serverQuery(gql`
  mutation TrackError($error_message: String!, $morgue_url: String!) {
    insert_dcsseeds_scrapePlayers_errors_one(
      object: { error: $error_message, morgue: $morgue_url }
      on_conflict: { constraint: dcsseeds_scrapePlayers_errors_error_morgue_turn_loc_note_key, update_columns: error }
    ) {
      morgue
    }
  }
`);
