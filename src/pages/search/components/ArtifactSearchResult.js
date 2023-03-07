import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styled from 'styled-components';
import { motion } from 'framer-motion';

import * as Unrands from 'src/utils/Unrands';
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
        let vertical_pad = null;

        const is_last = i !== props.item_list.length - 1;

        return (
          <React.Fragment key={item.name}>
            <Item {...props} {...item} />
            {is_last ? null : vertical_pad}
          </React.Fragment>
        );
      })}

      {show_more_count <= 0 ? null : (
        <MoreItemsRow>
          <td></td>
          <td></td>
          <td className="link">
            <Spacer.Vertical size="3" />
            <Spacer.Horizontal size="1" />
            <ItemsSeedVersionLink {...props}>
              See all <b>{show_more_count}</b> Ziggurat unrands
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
                  <Spacer.Vertical size="2" />
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

function Item(props) {
  const metadata = Unrands.Metadata[props.unrand_key];

  return (
    <ItemRow>
      <td className="location">
        <Branch>{props.branchName}</Branch>
        &nbsp;<Level>{props.level}</Level>
      </td>

      <td>
        <Spacer.Horizontal size="1" />
      </td>

      <ItemRight>
        <Name>
          <ItemsSeedVersionLink {...props}>
            <Image alt={props.name} src={metadata.image_url} layout="fixed" {...image_size} />
            <Spacer.Horizontal size="1" />
            {props.name}
          </ItemsSeedVersionLink>
        </Name>
      </ItemRight>
    </ItemRow>
  );
}

const image_size = { width: 24, height: 24 };

const ItemTable = styled.table`
  border-spacing: 0;
  font-size: var(--font-small);

  tr {
    height: ${image_size.width}px;
  }

  td {
    padding: 0;
  }
`;

const MoreItemsRow = styled.tr`
  .link {
    display: flex;
    align-items: flex-end;
    padding-left: ${image_size.width}px;
  }
`;

const ItemRow = styled.tr`
  vertical-align: top;
  margin: 0 0 var(--spacer-1) 0;

  .location {
    width: 120px;
    height: inherit;
    display: flex;
    align-items: center;
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const ItemRight = styled.td`
  width: 100%;
  text-align: left;
  vertical-align: middle;
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

const Level = styled.span``;

const ItemDivider = styled.div`
  background-color: var(--divider-color);
  height: 1px;
  width: 100%;
`;

const Branch = styled.span`
  font-weight: var(--font-bold);
`;

const Version = styled.span`
  font-weight: var(--font-bold);
`;

const Name = styled.div`
  /*
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  */
  a {
    display: flex;
    align-items: center;
  }
`;
