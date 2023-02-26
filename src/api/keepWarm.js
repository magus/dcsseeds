const { GraphQLClient } = require('graphql-request');
const send = require('src/server/zeitSend');
const GraphqlSeed = require('src/graphql/seed');

const { HASURA_ADMIN_SECRET, GRAPHQL_ENDPOINT } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// keep the postgres instance warm for faster query responses (prevent cold start)
// Example API Request
// http://localhost:3000/api/keepWarm

module.exports = async (req, res) => {
  try {
    // use graphql-request for fragment support
    const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    await graphQLClient.request(GraphqlSeed.RECENT_SEEDS.query);

    return send(res, 200);
  } catch (err) {
    return send(res, 500, err);
  }
};
