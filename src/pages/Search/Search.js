import * as React from 'react';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';

import { ItemSearch } from './components/ItemSearch';
import * as Spacer from 'src/components/Spacer';
import * as Unrands from 'src/utils/Unrands';

export default function Search(props) {
  return (
    <Container>
      <Spacer.Vertical size="2" />
      <AnimatePresence>
        <ItemSearch key="ItemSearch" {...props} />
      </AnimatePresence>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
  width: 100%;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;
