import * as React from 'react';
import styled from 'styled-components';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import CopyButton from 'src/components/CopyButton';

export default function Home(props) {
  const { loading, error, data } = useQuery(RECENT_SEEDS_GQL);

  if (loading) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      {data.recentSeeds.map((seedRow) => {
        return (
          <div key={seedRow.id}>
            <CopyButton>{seedRow.value}</CopyButton>
          </div>
        );
      })}
    </Container>
  );
}

const RECENT_SEEDS_GQL = gql`
  query {
    recentSeeds: seed(limit: 5) {
      id
      value
      created
    }
  }
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
