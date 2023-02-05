import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import { useArtifactFilter } from 'src/graphql/useArtifactFilter';
import { UNRANDS } from 'src/utils/Unrands';

import { ItemSearch } from './components/ItemSearch';
import * as Spacer from '../../components/Spacer';

function ArtifactFilter(props) {
  return (
    <AnimatePresence>
      <ArtifactFilterContainer>
        {UNRANDS.map((name, i) => {
          const active = props.filter_set.has(i);
          const count = props.artifact_count[i];

          function handle_click() {
            // console.debug({ name, i });
            if (count === 0) return;

            if (active) {
              props.remove_filter(i);
            } else {
              props.add_filter(i);
            }
          }

          if (count === 0) {
            return null;
          }

          return (
            <ArtifactFilterButtonGroup
              key={name}
              // force line break
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              <ArtifactFilterButton active={active} count={count} onClick={handle_click}>
                {name} ({count})
              </ArtifactFilterButton>
            </ArtifactFilterButtonGroup>
          );
        })}
      </ArtifactFilterContainer>
    </AnimatePresence>
  );
}

const ArtifactFilterContainer = styled.div`
  flex-direction: row;
`;

const ArtifactFilterButtonGroup = styled(motion.div)`
  display: inline-flex;
  margin: 0 var(--spacer-2) var(--spacer-2) 0;
`;

const ArtifactFilterButton = styled.button`
  font-size: var(--font-small);
  padding: var(--spacer-d2) var(--spacer-1);
  height: auto;
  transition: color, background-color 0.2s ease-out;

  ${(props) => {
    switch (true) {
      case props.active:
        return css`
          background-color: rgb(21, 128, 61);
          color: rgb(220, 252, 231);
        `;
      case props.count === 0:
        return css`
          background-color: #171717;
          color: #404040;
        `;
      default:
        return '';
    }
  }}
`;

export default function Search(props) {
  const artifact_filter = useArtifactFilter(props);
  console.debug('[artifact_filter]', artifact_filter);

  const router = useRouter();

  return (
    <Container>
      <Spacer.Vertical size="2" />

      <ItemSearch {...props} />

      <Spacer.Vertical size="2" />

      <ArtifactFilter {...artifact_filter} />
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;
