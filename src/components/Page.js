import * as React from 'react';
import { IntlProvider } from 'react-intl';

import SEOHeadTags from 'src/components/SEOHeadTags';
import withApolloClient from 'src/components/withApolloClient';

export default function Page(Component, { headTagProps, withApollo = false }) {
  if (!Component) {
    throw new Error('[Component] must be provided.');
  }

  function InternalPage(props) {
    return (
      <IntlProvider locale="en" defaultLocale="en">
        <SEOHeadTags {...headTagProps} />
        <Component {...props} />
      </IntlProvider>
    );
  }

  return withApollo ? withApolloClient(InternalPage) : InternalPage;
}
