import * as React from 'react';
import SEOHeadTags from 'src/components/SEOHeadTags';
import withApolloClient from 'src/components/withApolloClient';

export default function Page({ Component, headTagProps, withApollo = false }) {
  if (!Component) {
    throw new Error('[Component] must be provided.');
  }

  function InternalPage(props) {
    return (
      <React.Fragment>
        <SEOHeadTags {...headTagProps} />
        <Component {...props} />
      </React.Fragment>
    );
  }

  return withApollo ? withApolloClient(InternalPage) : InternalPage;
}
