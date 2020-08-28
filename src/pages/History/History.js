import * as React from 'react';
import styled from 'styled-components';
import { useMutation, useQuery } from '@apollo/client';

import Loading from 'src/components/Loading';
import SeedList from 'src/components/SeedList';
import StyledLink from 'src/components/StyledLink';

import * as GraphqlSeed from 'src/graphql/seed';

const SUBMIT_API = (morgue) => `/api/submit?morgue=${morgue}`;

export default function History(props) {
  const [mounted, set_mounted] = React.useState(false);

  React.useEffect(() => {
    if (process.browser) {
      set_mounted(true);
    }
  }, []);

  const historySeedsQuery = useQuery(GraphqlSeed.HISTORY_SEEDS.query, {
    // use cache but always refetch on mount
    fetchPolicy: 'cache-and-network',
  });

  const data = GraphqlSeed.HISTORY_SEEDS.parse(historySeedsQuery);

  if (!mounted || (historySeedsQuery.loading && !data)) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  return (
    <Container>
      <StyledLink href="/">Back to Home</StyledLink>

      <SeedList seeds={data} />
    </Container>
  );
}

const Container = styled.div`
  max-width: 640px;
  min-height: 100%;
  margin: 0 auto;
  padding: 24px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
