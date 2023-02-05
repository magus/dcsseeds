import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';

import { useArtifactFilter } from 'src/graphql/useArtifactFilter';

import { ItemSearch } from './components/ItemSearch';
import { ArtifactSearch } from './components/ArtifactSearch';
import * as Spacer from 'src/components/Spacer';

function SearchInternal(props) {
  const artifact_filter = useArtifactFilter(props);
  console.debug('[artifact_filter]', artifact_filter);

  const router = useRouter();

  if (artifact_filter.result_list.length) {
    return <ArtifactSearch key="ArtifactSearch" {...artifact_filter} />;
  } else if (router.query.q) {
    return <ItemSearch {...props} />;
  }

  return (
    <React.Fragment>
      <ItemSearch {...props} />

      <Spacer.Vertical size="2" />

      <ArtifactSearch key="ArtifactSearch" {...artifact_filter} />
    </React.Fragment>
  );
}

export default function Search(props) {
  return (
    <Container>
      <Spacer.Vertical size="2" />
      <AnimatePresence>
        <SearchInternal {...props} />
      </AnimatePresence>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;
