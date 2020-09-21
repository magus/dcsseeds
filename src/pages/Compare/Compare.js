import * as React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';

import Loading from 'src/components/Loading';
import ErrorPage from 'src/components/ErrorPage';

import * as GraphqlSeed from 'src/graphql/seed';
import seed from 'src/utils/seed';

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

  const maxScore = Math.max(data.playerA.aggregate.sum.score, data.playerB.aggregate.sum.score);
  const isWinner = (score) => maxScore === score;

  return (
    <Container>
      <CompareTitle>{gameCount} Games</CompareTitle>

      <CompareSeeds>
        <Total>Total</Total>
        {/* aggregate */}
        <CompareSeedsRow>
          <CompareSeedsPlayer color={playerColors[0]}>
            <PlayerColumn isBold={isWinner(data.playerA.aggregate.sum.score)}>{playerA}</PlayerColumn>
            <ScoreColumn>
              <Score>{data.playerA.aggregate.sum.score}</Score>
            </ScoreColumn>
          </CompareSeedsPlayer>
          <CompareSeedsPlayer color={playerColors[1]}>
            <PlayerColumn isBold={isWinner(data.playerB.aggregate.sum.score)}>{playerB}</PlayerColumn>
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

  const [hover, set_hover] = React.useState(false);

  return (
    <CompareSeedsRow onMouseEnter={() => set_hover(true)} onMouseLeave={() => set_hover(false)}>
      {players.map((player, i) => {
        const isWinner = maxScore === player.score;

        return (
          <CompareSeedsPlayer key={player.name} color={isWinner ? playerColors[i] : loserColor}>
            <PlayerColumn>{player.name}</PlayerColumn>
            <ScoreColumn>
              <Score href={player.morgue}>{player.score}</Score>
            </ScoreColumn>
          </CompareSeedsPlayer>
        );
      })}

      {!hover ? null : <SeedInfo seed={seed} />}
    </CompareSeedsRow>
  );
}

function SeedInfo({ seed }) {
  return (
    <SeedInfoContainer>
      <div>{seed.species}</div>
      <div>{seed.background}</div>
    </SeedInfoContainer>
  );
}

const playerColors = ['#F6AD55', '#81E6D9'];
const loserColor = 'rgba(255, 255, 255, 0.40)';

const scoreFormatter = new Intl.NumberFormat('en');

function Score(props) {
  return (
    <Link href={props.href} rel="noopener" target="_blank">
      {scoreFormatter.format(props.children)}
    </Link>
  );
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

const Layers = {
  SeedInfoHover: 1,
};

const Link = styled.a`
  color: inherit;
  text-decoration: none;
`;

const SeedInfoContainer = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  z-index: ${Layers.SeedInfoHover};
  background-color: black;
  border: 1px solid white;
  padding: 16px;
  width: 100%;
  pointer-events: none;
`;

const CompareSeeds = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CompareSeedsRow = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 16px;
  margin: 16px 0;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const CompareSeedsPlayer = styled.div`
  display: flex;
  flex-direction: row;
  color: ${(props) => props.color || 'inherit'};
  font-weight: ${(props) => (props.isNormal ? 'inherit' : props.isBold ? 800 : 200)};
`;

const PlayerColumn = styled.div`
  flex: 0.3;
  font-weight: ${(props) => (props.isNormal ? 'inherit' : props.isBold ? 800 : 200)};
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
