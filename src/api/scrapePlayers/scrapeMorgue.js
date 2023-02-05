import { gql } from '@apollo/client';
import { query } from 'graphqurl';
import parseMorgue from 'src/utils/parseMorgue';
import send from 'src/server/utils/zeitSend';

import { Morgue } from './Morgue';
import { SERVER_CONFIG } from './ServerConfig';
import { addMorgue } from './addMorgue';

const { HASURA_ADMIN_SECRET, GRAPHQL_ENDPOINT } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// force scrape a morgue file, storing results in scrapePlayers_item
// http://localhost:3000/api/scrapeMorgue?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230114-084156.txt

module.exports = async function handler(req, res) {
  try {
    const morgue_url = req.query.morgue;

    if (!morgue_url) {
      throw new Error('Must provide [morgue]');
    }

    const hrStartTime = process.hrtime();

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

    // get player
    const variables = { name: morgue.player, server };

    const player_result = await query({
      query: GQL_PlayerByNameServer,
      endpoint: GRAPHQL_ENDPOINT,
      variables,
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const [player] = player_result.data.player_list;

    if (!player?.id) {
      throw new Error(`player not found [${JSON.stringify(variables)}]`);
    }

    // clear all items from any previous scrapes
    const clear_result = await query({
      query: GQL_ClearMorgueItems,
      endpoint: GRAPHQL_ENDPOINT,
      variables: { morgue: morgue_url },
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const cleared_items = clear_result.data.item.affected_rows;

    const response = await addMorgue({ player, morgue });

    const timeMs = hrTimeUnit(process.hrtime(hrStartTime), 'ms');
    const data = { timeMs, morgue, cleared_items, player, response };
    return send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return send(res, 500, err, { prettyPrint: true });
  }
};

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

const GQL_PlayerByNameServer = gql`
  query PlayerByNameServer($name: String!, $server: String!) {
    player_list: dcsseeds_scrapePlayers(where: { name: { _eq: $name }, server: { _eq: $server } }) {
      id
      name
      server
    }
  }
`;

const GQL_ClearMorgueItems = gql`
  mutation ClearMorgueItems($morgue: String!) {
    item: delete_dcsseeds_scrapePlayers_item(where: { morgue: { _eq: $morgue } }) {
      affected_rows
    }
  }
`;
