import * as React from 'react';
import Home from './Home';
import SEOHeadTags from 'src/components/SEOHeadTags';
import withApolloClient from 'src/components/withApolloClient';

function HomePage(props) {
  return (
    <React.Fragment>
      <SEOHeadTags />
      <Home {...props} />
    </React.Fragment>
  );
}

export default withApolloClient(HomePage);
