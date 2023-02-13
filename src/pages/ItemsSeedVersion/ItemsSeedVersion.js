import * as React from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';

import * as Spacer from 'src/components/Spacer';

import { ItemList } from './ItemList';

export function ItemsSeedVersion(props) {
  // console.debug('[ItemsSeedVersion]', { props });

  return (
    <Container>
      <Spacer.Vertical size="2" />
      <AnimatePresence>
        <ItemList seed={props.seed} version={props.version} item_list={props.item_list} />
      </AnimatePresence>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100%;
  min-width: 320px;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;
