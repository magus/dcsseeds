import { expect, test } from 'bun:test';
import * as React from 'react';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { renderToString } from 'react-dom/server';
import { RouterContext } from 'next/dist/shared/lib/router-context';

import * as Unrands from 'src/utils/Unrands';
import { ArtifactSearch } from './ArtifactSearch';

test('renders artifact and version counts on the server before the full download', () => {
  const client = new ApolloClient({ cache: new InMemoryCache() });
  const props = {
    version_list: ['0.34.1'],
    branch_level_order: [],
    artifact_summary: {
      artifact_count: Unrands.List.map(() => 42),
      version_count: [['0.34.1', 123]],
    },
  };
  const router = { query: {}, pathname: '/', isReady: false };
  const html = renderToString(
    <RouterContext.Provider value={router}>
      <ApolloProvider client={client}>
        <ArtifactSearch {...props} />
      </ApolloProvider>
    </RouterContext.Provider>,
  );

  expect(html).toContain('amulet of the Air');
  expect(html).toContain('0.34.1');
  expect(html).toContain('123');
  expect(html).toContain('42');
  expect(html).not.toContain('Loading');
  expect(html).not.toContain('disabled');
});
