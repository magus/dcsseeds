import * as React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import CopyButton from 'src/components/CopyButton';
import { TimeAgo } from 'src/components/TimeAgo';
import * as Spacer from 'src/components/Spacer';

export function ArtifactSearchResult(props) {
  // console.debug('[ArtifactSearchResult]', props);

  return (
    <Container>
      {props.item_list.map((item) => (
        <Item key={item.name} {...item} />
      ))}

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

function Item(props) {
  const morgue = `/api/parseMorgue?morgue=${props.morgue}`;

  return (
    <ItemRow>
      <div>
        <Branch>{props.branchName}</Branch>
        &nbsp;<Level>{props.level}</Level>
      </div>

      <Link href={morgue} rel="noopener noreferrer" target="_blank">
        <Name>{props.name}</Name>
      </Link>
    </ItemRow>
  );
}

const ItemRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

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
  width: 100%;
  margin: var(--spacer-1) 0;
  padding: var(--spacer-3) var(--spacer-3);
  border-radius: var(--spacer-1);
  background-color: var(--button-bg);
  display: flex;
  flex-direction: column;
`;

const Name = styled.span`
  font-size: var(--font-small);
`;

const Level = styled.span`
  font-size: var(--font-normal);
`;

const Branch = styled.span`
  font-size: var(--font-medium);
  font-weight: var(--font-bold);
`;

const Version = styled.span`
  font-size: var(--font-small);
  font-weight: var(--font-bold);
  color: var(--gray400);
`;

const Link = styled.a`
  color: var(--blue-color);
  text-decoration: none;
  :visited {
    color: var(--blue-color);
  }
`;
