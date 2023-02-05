import * as React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

import CopyButton from 'src/components/CopyButton';
import { TimeAgo } from 'src/components/TimeAgo';
import * as Spacer from 'src/components/Spacer';

export function ArtifactSearchResult(props) {
  // console.debug('[ArtifactSearchResult]', props);

  return (
    <Container>
      <table>
        <tbody>
          {props.item_list.map((item, i) => {
            let vertical_pad = null;

            if (i !== props.item_list.length - 1) {
              vertical_pad = (
                <tr>
                  <td>
                    <Spacer.Vertical size="d2" />
                  </td>
                </tr>
              );
            }

            return (
              <React.Fragment key={item.name}>
                <Item {...item} />
                {vertical_pad}
              </React.Fragment>
            );
          })}
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

function Item(props) {
  const morgue = `/api/parseMorgue?morgue=${props.morgue}`;

  return (
    <ItemRow>
      <td>
        <Branch>{props.branchName}</Branch>
        &nbsp;<Level>{props.level}</Level>
      </td>

      <td>
        <Spacer.Horizontal size="1" />
      </td>

      <ItemRight>
        <Name>
          <Link href={morgue} rel="noopener noreferrer" target="_blank">
            {props.name}
          </Link>
        </Name>
      </ItemRight>
    </ItemRow>
  );
}

const ItemRow = styled.tr`
  vertical-align: top;
`;

const ItemRight = styled.td`
  text-align: right;
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

const LinkColor = css`
  color: var(--blue-color);
  text-decoration: none;
`;

const Name = styled.div`
  ${LinkColor}

  font-size: var(--font-small);
  /*
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  */
`;

const Link = styled.a`
  ${LinkColor}

  :visited {
    color: var(--blue-color);
  }
`;
