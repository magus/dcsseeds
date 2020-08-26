import * as React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://dcsseeds.herokuapp.com/v1/graphql',
    }),
    cache: new InMemoryCache(),
  });
};

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
