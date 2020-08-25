import * as React from 'react';
import styled from 'styled-components';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import CopyButton from 'src/components/CopyButton';
import Username from 'src/components/Username';

export default function Home(props) {
  const { loading, error, data } = useQuery(RECENT_SEEDS_GQL);

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

  return (
    <Container>
      <RecentSeeds>
        {data.recentSeeds.map((seedRow) => {
          return (
            <SeedRow key={Math.random()}>
              <Timestamp>{seedRow.created}</Timestamp>
              <CopyButton>{seedRow.value}</CopyButton>
              <Username>magusnn</Username>
            </SeedRow>
          );
        })}
      </RecentSeeds>
    </Container>
  );
}

function Timestamp({ children: timestamp }) {
  return <TimestampText>{new Date(timestamp).toLocaleString()}</TimestampText>;
}

const RECENT_SEEDS_GQL = gql`
  {
    recentSeeds: seed(limit: 5, order_by: { created: desc }) {
      id
      value
      created
    }
  }
`;

const Container = styled.div`
  min-height: 100%;
  overflow: scroll;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.div`
  font-size: 48px;
  font-weight: 800;
`;

const RecentSeeds = styled.div`
  display: flex;
  flex-direction: column;
`;

const SeedRow = styled.div`
  display: flex;
  flex-direction: column;
  margin: 24px 0;
  > * {
    margin: 8px 0;
  }
`;

const TimestampText = styled.div`
  font-size: 14px;
`;
