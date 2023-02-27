import { gql } from '@apollo/client';

import parseMorgue from 'src/utils/parseMorgue';
import send from 'src/server/zeitSend';
import { serverQuery } from 'src/graphql/serverQuery';

import { Morgue } from './Morgue';
import { SERVER_CONFIG } from './ServerConfig';
import { addMorgue } from './addMorgue';

const { HASURA_ADMIN_SECRET, GRAPHQL_ENDPOINT } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// force scrape a morgue file, storing results in scrapePlayers_item
// http://localhost:3000/api/scrapeMorgue?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230114-084156.txt

// items            http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-012223.txt
// no items (skip)  http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230226-011455.txt
// error            http://crawl.akrasiac.org/rawdata/magusnn/

module.exports = async function handler(req, res) {
  const hrStartTime = process.hrtime();

  const morgue_url = req.query.morgue;

  try {
    if (!morgue_url) {
      throw new Error('Must provide [morgue]');
    }

    const morgue = new Morgue(morgue_url);

    // determine server from morgue_url
    let server;

    for (const server_name of Object.keys(SERVER_CONFIG)) {
      const config = SERVER_CONFIG[server_name];
      const re = new RegExp(`^${config.rawdata_base}`);
      if (re.test(morgue_url)) {
        server = server_name;
        break;
      }
    }

    if (!server) {
      throw new Error('server not recognized');
    }

    // clear all items from any previous scrapes
    const cleared_items = await GQL_ClearMorgueItems.run({ morgue_url });

    // get player or create if it does not exist
    const name = morgue.player;
    const player = await GQL_UpsertPlayer.run({ name, server });

    // parse and add the morgue items
    const response = await addMorgue({ player, morgue });

    // ensure error response treated as error
    if (response.status === 'error') {
      throw new Error(response.extra.message);
    }

    const timeMs = hrTimeUnit(process.hrtime(hrStartTime), 'ms');
    const data = { timeMs, morgue, cleared_items, player, response };
    return send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    // immediate response
    send(res, 500, err, { prettyPrint: true });

    // track this error remotely
    const error_message = err.message || '__unknown__';
    GQL_TrackError.run({ error_message, morgue_url });
  }
};

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

function hrTimeUnit(hrTime, unit) {
  switch (unit) {
    case 'ms':
      return hrTime[0] * 1e3 + hrTime[1] / 1e6;
    case 'micro':
      return hrTime[0] * 1e6 + hrTime[1] / 1e3;
    case 'nano':
    default:
      return hrTime[0] * 1e9 + hrTime[1];
  }
}
