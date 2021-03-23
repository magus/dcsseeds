import * as React from 'react';
import styled from 'styled-components';

import { IconMessage } from 'src/components/IconMessage';

import { Loading } from './Loading';
import { SearchResult } from './SearchResult';

// search results animation
// framer-motion initial random position with layout prop
// should simulate results flying in from random direction as if pulling from various sources
// unmount fly out to bottom

function SearchResultsInternal(props) {
  if (!props.search) {
    return null;
  }

  if (props.loading || !props.results) {
    return <Loading />;
  }

  if (props.results.length < 1) {
    return <IconMessage icon="🤷🏻‍♀️" message="No results" />;
  }

  return props.results.map((result) => {
    return <SearchResult key={result.id} search={props.search} result={result} />;
  });
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
