import * as React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';

function createApolloClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.GRAPHQL_ENDPOINT,
    }),
    cache: new InMemoryCache(),
  });
}

const sharedClient = createApolloClient();

export default function withApolloClient(Component) {
  return function ComponentWithApollo(props) {
    return (
      <ApolloProvider client={sharedClient}>
        <Component {...props} />
      </ApolloProvider>
    );
  };
}
