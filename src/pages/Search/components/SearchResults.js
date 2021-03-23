import * as React from 'react';
import styled from 'styled-components';

import { Loading } from './Loading';
import { SearchResult } from './SearchResult';

// search results animation
// framer-motion initial random position with layout prop
// should simulate results flying in from random direction as if pulling from various sources
// unmount fly out to bottom

export function SearchResults(props) {
  return (
    <Container>
      {props.loading && !props.results.length ? (
        <Loading />
      ) : (
        props.results.map((result) => {
          return <SearchResult key={result.id} search={props.search} result={result} />;
        })
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
