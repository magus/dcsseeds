import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { Item } from 'src/pages/search/components/Item';
import CopyButton from 'src/components/CopyButton';
import * as Spacer from 'src/components/Spacer';

export function ItemList(props) {
  return (
    <Container>
      <table>
        <tbody>
          <ItemListRows {...props} />
        </tbody>
      </table>

      <Spacer.Vertical size="2" />

      <BottomRow>
        <BottomLeft>
          <CopyButton tooltip copy={props.seed} title="Click to copy seed" copyMessage="Seed copied!">
            🌱
          </CopyButton>
        </BottomLeft>

        <Version>{props.version}</Version>
      </BottomRow>
    </Container>
  );
}

function ItemListRows(props) {
  return props.item_list.map((item, i) => {
    let vertical_pad = null;

    const is_last = i !== props.item_list.length - 1;

    return (
      <React.Fragment key={[item.name, item.branchName, item.level].join('-')}>
        <MorgueItem {...props} {...item} />
        {is_last ? null : vertical_pad}
      </React.Fragment>
    );
  });
}

function MorgueItem(props) {
  const highlight = props.highlight.has(props.name);

  return (
    <Item
      // force line break
      {...props}
      highlight={highlight}
      SlotNameWrapper={MorgueLink}
    />
  );
}

function MorgueLink(props) {
  const { morgue } = props;

  const morgue_link = {
    pathname: '/api/parseMorgue',
    query: { morgue },
  };

  return (
    <Link href={morgue_link}>
      <a rel="noopener noreferrer">{props.children}</a>
    </Link>
  );
}

const BottomRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const BottomLeft = styled.div`
  align-self: flex-end;
  /* pull left to compensate for button margins */
  margin: calc(-1 * var(--spacer-2));

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Container = styled(motion.div)`
  margin: var(--spacer-1) 0;
  padding: var(--spacer-3) var(--spacer-3);
  border-radius: var(--spacer-1);
  background-color: var(--button-bg);
  display: flex;
  flex-direction: column;
`;

const Version = styled.span`
  font-size: var(--font-small);
  font-weight: var(--font-bold);
`;
