import * as React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';

import * as Spacer from 'src/components/Spacer';

import { ItemList } from './ItemList';

export function ItemsSeedVersion(props) {
  return (
    <Container>
      <Spacer.Vertical size="2" />
      <AnimatePresence>
        <ItemSeedVersionInternal {...props} />
      </AnimatePresence>
    </Container>
  );
}

function ItemSeedVersionInternal(props) {
  const router = useRouter();

  let highlight = [];
  if (Array.isArray(router.query.highlight)) {
    highlight = router.query.highlight;
  } else if (router.query.highlight) {
    highlight = [router.query.highlight];
  }

  // console.debug('[ItemsSeedVersionInternal]', { props, highlight });

  if (!Array.isArray(props.item_list) || !props.item_list.length) {
    return (
      <span>
        No recorded items for seed <b>{props.seed}</b> on version <b>{props.version}</b>.
      </span>
    );
  }

  return (
    <ItemList
      // force line break
      seed={props.seed}
      version={props.version}
      item_list={props.item_list}
      highlight={new Set(highlight)}
    />
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
