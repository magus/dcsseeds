import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import { useArtifactFilter } from 'src/graphql/useArtifactFilter';
import { ArtifactSearchResult } from './ArtifactSearchResult';
import { UNRANDS } from 'src/utils/Unrands';

import * as Spacer from 'src/components/Spacer';

export function ArtifactSearch(props) {
  return (
    <Container>
      <ArtifactFilters {...props} />

      <Spacer.Vertical size="2" />

      <ArtifactResults {...props} />
    </Container>
  );
}

function ArtifactResults(props) {
  const { result_list } = props;

  return props.result_list.map((result, i) => {
    const key = [result.seed, result.version].join('-');
    return (
      <motion.div
        // force line break
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        layout
      >
        <ArtifactSearchResult {...result} />
      </motion.div>
    );
    return;
  });
}

function ArtifactFilters(props) {
  return UNRANDS.map((name, i) => {
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
      <ButtonGroup
        key={name}
        // force line break
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        layout
      >
        <Button active={active} count={count} onClick={handle_click}>
          {name} ({count})
        </Button>
      </ButtonGroup>
    );
  });
}

const Container = styled.div`
  flex-direction: row;
`;

const ButtonGroup = styled(motion.div)`
  display: inline-flex;
  margin: 0 var(--spacer-2) var(--spacer-2) 0;
`;

const Button = styled.button`
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
