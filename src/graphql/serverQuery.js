import { GraphQLClient } from 'graphql-request';

if (!process) throw new Error('process is missing from globals!');

const { HASURA_ADMIN_SECRET, GRAPHQL_ENDPOINT } = process.env;

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

const graphQLClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
  },
});
