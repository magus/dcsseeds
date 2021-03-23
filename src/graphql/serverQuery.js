import { GraphQLClient } from 'graphql-request';

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

export function serverQuery(query, parse) {
  async function run(variables) {
    const data = await graphQLClient.request(query, variables);

    if (typeof parse === 'function' && data) {
      return parse(data);
    }

    return data;
  }

  return {
    run,
  };
}

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
  },
});
