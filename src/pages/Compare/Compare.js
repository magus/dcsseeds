import * as React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';

import Loading from 'src/components/Loading';
import ErrorPage from 'src/components/ErrorPage';

import * as GraphqlSeed from 'src/graphql/seed';

export default function Compare(props) {
  const { playerA, playerB } = props;

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
  const playersOrder = [playerA, playerB];

  const comparedSeeds = data.compareSeeds.map((seed) => {
    const maxScore = Math.max(...seed.players.map((_) => _.score));
    const players = [...seed.players];
    players.sort((a, b) => (playersOrder.indexOf(a.name) > playersOrder.indexOf(b.name) ? 1 : -1));
    const winners = seed.players.filter((_) => _.score === maxScore);
    const winner = winners.length > 1 ? null : winners[0];

    return { ...seed, players, maxScore, winner };
  });

  const winCounts = {};
  comparedSeeds.forEach((seed) => {
    if (!winCounts[seed.winner.name]) {
      winCounts[seed.winner.name] = 0;
    }

    winCounts[seed.winner.name] += 1;
  });

  return (
    <Container>
      <CompareTitle>{gameCount} Games</CompareTitle>

      <CompareSeeds>
        <Total>Total</Total>
        {/* aggregate */}
        <CompareSeedsRow>
          <CompareSeedsPlayer isNormal isBold={false} color={playerColors[0]}>
            <PlayerColumn>{playerA}</PlayerColumn>
            <ScoreColumn>
              <Score>{data.playerA.aggregate.sum.score}</Score>
            </ScoreColumn>
          </CompareSeedsPlayer>
          <CompareSeedsPlayer isNormal isBold={false} color={playerColors[1]}>
            <PlayerColumn>{playerB}</PlayerColumn>
            <ScoreColumn>
              <Score>{data.playerB.aggregate.sum.score}</Score>
            </ScoreColumn>
          </CompareSeedsPlayer>
        </CompareSeedsRow>

        <TotalDivider />

        {/* for each seed */}
        {comparedSeeds.map((seed) => {
          return <CompareSeed key={seed.id} seed={seed} playersOrder={playersOrder} />;
        })}
      </CompareSeeds>
    </Container>
  );
}

function CompareSeed({ seed }) {
  const { players, maxScore } = seed;

  return (
    <CompareSeedsRow>
      {players.map((player, i) => {
        const isWinner = maxScore === player.score;

        return (
          <CompareSeedsPlayer key={player.name} color={isWinner ? playerColors[i] : loserColor}>
            <PlayerColumn>{player.name}</PlayerColumn>
            <ScoreColumn>
              <Score>{player.score}</Score>
            </ScoreColumn>
          </CompareSeedsPlayer>
        );
      })}
    </CompareSeedsRow>
  );
}

const playerColors = ['#F6AD55', '#81E6D9'];
const loserColor = 'rgba(255, 255, 255, 0.40)';

const scoreFormatter = new Intl.NumberFormat('en');

function Score(props) {
  return scoreFormatter.format(props.children);
}

function TableLayoutRow({ data, widths }) {
  return (
    <div style={{ display: 'flex' }}>
      {data.map((col, i) => (
        <div style={{ flex: widths[i] || 0 }}>{col}</div>
      ))}
    </div>
  );
}

const CompareSeeds = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 640px;
  min-width: 320px;
`;

const CompareSeedsRow = styled.div`
  margin: 8px 0;
  display: flex;
  flex-direction: column;
`;

const CompareSeedsPlayer = styled.div`
  display: flex;
  flex-direction: row;
  color: ${(props) => props.color || 'inherit'};
  font-weight: ${(props) => (props.isNormal ? 'inherit' : props.isBold ? 800 : 200)};
`;

const PlayerColumn = styled.div`
  flex: 0.3;
  font-weight: ${(props) => (props.isBold ? 800 : 200)};
`;

const ScoreColumn = styled.div`
  flex: 0.7;
  text-align: right;
  font-variant: tabular-nums;
`;

const CompareTitle = styled.div`
  font-size: 24px;
  margin: 24px 0;
`;

const Total = styled.div`
  font-size: 24px;
`;

const TotalDivider = styled.div`
  margin: 0 0 12px 0;
  background-color: white;
  height: 1px;
  width: 100%;
`;

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
