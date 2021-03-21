const { GraphQLClient } = require('graphql-request');
import { gql } from '@apollo/client';
const send = require('src/server/utils/zeitSend');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// Example API Request
// http://localhost:3000/api/job/scrapePlayers

module.exports = async (req, res) => {
  try {
    const { id, i } = req.query;

    console.log('scrapePlayers', 'start');

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

    console.log('scrapePlayers', 'end');

    return send(res, 200);
  } catch (err) {
    return send(res, 500, err);
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
  },
});
