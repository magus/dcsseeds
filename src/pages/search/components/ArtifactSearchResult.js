import * as React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import { Item } from 'src/pages/search/components/Item';
import CopyButton from 'src/components/CopyButton';
import * as Spacer from 'src/components/Spacer';

function ItemListRows(props) {
  let item_list;

  if (!props.filter) {
    item_list = props.item_list;
  } else {
    item_list = props.item_list.filter((item) => {
      return item.branchName !== 'Ziggurat';
    });
  }

  const show_more_count = props.item_list.length - item_list.length;

  return (
    <React.Fragment>
      {item_list.map((item, i) => {
        let vertical_pad = <Spacer.Vertical size="1" />;

        const is_last = i === props.item_list.length - 1;

        return (
          <React.Fragment key={[item.name, item.branchName, item.level].join('-')}>
            <Item
              // force line break
              {...props}
              {...item}
              SlotNameWrapper={ItemsSeedVersionLink}
            />

            {is_last ? null : vertical_pad}
          </React.Fragment>
        );
      })}

      {show_more_count <= 0 ? null : (
        <MoreItemsRow>
          <td></td>
          <td></td>
          <td className="link">
            <Spacer.Horizontal size="1" />
            <ItemsSeedVersionLink {...props}>
              +<b>{show_more_count}</b> Ziggurat unrand{show_more_count > 1 ? 's' : ''}
            </ItemsSeedVersionLink>
          </td>
        </MoreItemsRow>
      )}
    </React.Fragment>
  );
}
export function ArtifactSearchResult(props) {
  // console.debug('[ArtifactSearchResult]', props);

  const active_set = new Set();
  for (const item of props.item_list) {
    active_set.add(item.name);
  }

  const rest_item_list = props.all_item_list.filter((i) => !active_set.has(i.name));

  return (
    <Container>
      <ItemTable>
        <tbody>
          <ItemListRows {...props} />

          {rest_item_list.length === 0 ? null : (
            <>
              <tr>
                <td colSpan="999">
                  <Spacer.Vertical size="1" />
                  <ItemDivider />
                  <Spacer.Vertical size="1" />
                </td>
              </tr>

              <ItemListRows {...props} filter item_list={rest_item_list} />
            </>
          )}
        </tbody>
      </ItemTable>

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

function ItemsSeedVersionLink(props) {
  const { seed, version } = props;

  const highlight = props.all_item_list.map((item) => item.name);

  const items_link = {
    pathname: '/items/[version]/[seed]',
    query: { seed, version, highlight },
  };

  return (
    <Link passHref href={items_link}>
      <a rel="noopener noreferrer">{props.children}</a>
    </Link>
  );
}

const ItemTable = styled.table`
  border-spacing: 0;
  border-collapse: collapse;
  font-size: var(--font-small);

  tr {
    line-height: var(--spacer-4);
  }

  td {
    padding: 0;
  }
`;

const MoreItemsRow = styled.tr`
  .link {
    display: flex;
    align-items: flex-end;
    padding-left: var(--spacer-4);
  }
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
  margin: var(--spacer-1) 0;
  padding: var(--spacer-3) var(--spacer-3);
  border-radius: var(--spacer-1);
  background-color: var(--button-bg);
  display: flex;
  flex-direction: column;
`;

const ItemDivider = styled.div`
  background-color: var(--divider-color);
  height: 1px;
  width: 100%;
`;

const Version = styled.span`
  font-weight: var(--font-bold);
`;
