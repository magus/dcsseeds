import * as React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { IconMessage } from 'src/components/IconMessage';
import { Loading } from 'src/components/Loading';

import { SearchResult } from './SearchResult';

// search results animation
// framer-motion initial random position with layout prop
// should simulate results flying in from random direction as if pulling from various sources
// unmount fly out to bottom

function SearchResultsInternal(props) {
  const router = useRouter();

  // hide results when artifact filter is active
  if (router.query.a) {
    return null;
  }

  if (!props.search) {
    return null;
  }

  if (props.results && props.results.length) {
    return props.results.map((result) => {
      return <SearchResult key={result.id} search={props.search} result={result} />;
    });
  }

  if (props.loading || !props.results) {
    return <Loading />;
  }

  return <IconMessage icon="🤷🏻‍♀️" message="No results" />;
}

export function SearchResults(props) {
  return (
    <Container>
      <SearchResultsInternal {...props} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
