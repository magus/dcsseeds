import * as React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

import Loading from 'src/components/Loading';
import ErrorPage from 'src/components/ErrorPage';

import GraphqlSeed from 'src/graphql/seed';

const COMPARE_TOKEN = '..';

export default function Compare(props) {
  const router = useRouter();
  const { compareSyntax } = router.query;

  if (!compareSyntax) {
    return <ErrorPage header="Error" message="Oops" />;
  }

  const [playerA, playerB] = compareSyntax.split(COMPARE_TOKEN);

  if (!playerA || !playerB) {
    return <ErrorPage header="Error" message="Oops" />;
  }

  const { loading, error, data } = useQuery(GraphqlSeed.COMPARE_PLAYERS, {
    variables: {
      playerA,
      playerB,
    },
  });

  if (loading) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  const gameCount = data.playerA.aggregate.count;

  return (
    <Container>
      <div>{gameCount} Games</div>
      <PlayerScore name={playerA} playerData={data.playerA} />
      <PlayerScore name={playerB} playerData={data.playerB} />
    </Container>
  );
}

function PlayerScore({ name, playerData }) {
  const { score } = playerData.aggregate.sum;
  return (
    <div>
      {name}({score})
    </div>
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
