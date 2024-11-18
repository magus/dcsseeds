import * as React from 'react';

import styled from 'styled-components';
import Image from 'next/image';

import { cn } from '~/core/cn';

import * as Spacer from 'src/components/Spacer';
import * as Unrands from 'src/utils/Unrands';

export function Item(props) {
  // get unrand metadata by props.unrand_key or try to match unrand by name
  const metadata = (function get_metadata() {
    if (props.unrand_key) {
      return Unrands.Metadata[props.unrand_key];
    }

    for (const unrand of Unrands.Metadata) {
      if (props.name.includes(unrand.name)) {
        return unrand;
      }
    }
  })();

  const SlotNameWrapper = props.SlotNameWrapper || React.Fragment;

  return (
    <ItemRow className={cn(props.highlight && 'highlight')}>
      <td className="location">
        <Branch>{props.branchName}</Branch>
        {!props.level ? null : (
          <React.Fragment>
            &nbsp;<Level>{props.level}</Level>
          </React.Fragment>
        )}
      </td>

      <td>
        <Spacer.Horizontal size="2" />
      </td>

      <ItemRight>
        <SlotNameWrapper {...props}>
          <Name highlight>
            <span className="image">
              {!metadata ? null : <Image alt={props.name} src={metadata.image_url} {...image_size} />}
            </span>

            <Spacer.Horizontal size="1" />

            <span className="name">{props.name}</span>

            <Spacer.Horizontal size="1" />

            {!props.gold ? null : (
              <span>
                <span>(</span>
                <span className="gold">{props.gold} gold</span>
                <span>)</span>
              </span>
            )}
          </Name>
        </SlotNameWrapper>
      </ItemRight>
    </ItemRow>
  );
}

const image_size = { width: 32, height: 32 };

const ItemRow = styled.tr`
  &.highlight {
    font-weight: var(--font-bold);

    .name {
      color: rgb(34 197 94);
    }
  }

  .location {
    display: inline-block;
    width: var(--spacer-11);
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;

const Level = styled.span``;

const Branch = styled.span`
  font-weight: var(--font-bold);
`;

const ItemRight = styled.td`
  width: 100%;
  text-align: left;
  vertical-align: middle;
`;

const Name = styled.div`
  line-height: var(--spacer-2);
  display: flex;
  align-items: center;

  /*
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  */

  .gold {
    color: gold;
  }

  span.image {
    min-width: var(--spacer-4);
    max-width: var(--spacer-4);
    min-height: var(--spacer-4);
    max-height: var(--spacer-4);
  }

  .name {
    display: flex;
    align-items: center;
  }
`;
