import * as React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from '@apollo/client';
import Home from './Home';

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://dcsseeds.herokuapp.com/v1/graphql',
    }),
    cache: new InMemoryCache(),
  });
};

export default function HomePage(props) {
  const client = createApolloClient();

  return (
    <ApolloProvider client={client}>
      <Home {...props} />
    </ApolloProvider>
  );
}
