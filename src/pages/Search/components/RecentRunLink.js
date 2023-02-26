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
    <Container>
      <TinyBelowSearch>
        <Link passHref href="/morgue/add">
          <a rel="noopener noreferrer">
            <Spacer.Horizontal size="1" style={{ display: 'inline-block' }} />
            <span>Add morgue...</span>
          </a>
        </Link>

        <Link passHref href={recent_run_link}>
          <a rel="noopener noreferrer">
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
          </a>
        </Link>
      </TinyBelowSearch>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TinyBelowSearch = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: var(--font-tiny);
`;

const format_number = new Intl.NumberFormat();
