import * as React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import * as Spacer from 'src/components/Spacer';
import { TimeAgo } from 'src/components/TimeAgo';

export function RecentRunLink(props) {
  const { seed, version } = props.recent_run;

  const recent_run_link = {
    pathname: '/items/[version]/[seed]',
    query: { seed, version },
  };

  return (
    <Link passHref href={recent_run_link}>
      <a rel="noopener noreferrer" target="_blank">
        <TinyBelowSearch>
          <span>
            <b>{props.recent_run.player_name}</b>
          </span>
          &nbsp;
          <span>
            found <b>{format_number.format(props.recent_run.item_count)}</b> items
          </span>
          &nbsp;
          <span className="datetime">
            (<TimeAgo date={props.recent_run.updated_at} />)
          </span>
          <Spacer.Horizontal size="1" style={{ display: 'inline-block' }} />
        </TinyBelowSearch>
      </a>
    </Link>
  );
}

const TinyBelowSearch = styled.div`
  font-size: var(--font-tiny);
  text-align: right;
`;

const format_number = new Intl.NumberFormat();
