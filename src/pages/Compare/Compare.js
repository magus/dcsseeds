import * as React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';

import Loading from 'src/components/Loading';
import ErrorPage from 'src/components/ErrorPage';
import useTouch from 'src/hooks/useTouch';

import * as GraphqlSeed from 'src/graphql/seed';
import seed from 'src/utils/seed';

export default function Compare(props) {
  const { playerA, playerB } = props;

  if (!playerA || !playerB) {
    return <ErrorPage header="Error" message="Oops" />;
  }

  const [details, set_details] = React.useState(null);
  const isTouch = useTouch();

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
        {/* headers */}
        <CompareSeedsRowContent>
          <CompareSeedsPlayer>
            <PlayerColumn>Player</PlayerColumn>
            <TurnsColumn>Turns/sec</TurnsColumn>
            <TimeColumn>Time</TimeColumn>
            <RuneColumn>Runes</RuneColumn>
            <ScoreColumn>Score</ScoreColumn>
          </CompareSeedsPlayer>
        </CompareSeedsRowContent>

        {/* aggregate */}
        <CompareSeedsRow>
          <CompareSeedsRowContent>
            <CompareSeedsPlayer color={playerColors[0]}>
              <PlayerColumn isBold={isWinner(data.playerA.aggregate.sum.score)}>{playerA}</PlayerColumn>
              <TurnsColumn></TurnsColumn>
              <TimeColumn></TimeColumn>
              <RuneColumn></RuneColumn>
              <ScoreColumn>
                <Score>{data.playerA.aggregate.sum.score}</Score>
              </ScoreColumn>
            </CompareSeedsPlayer>
            <ScoreRatioVisual ratio={data.playerA.aggregate.sum.score / maxScore} color={playerColors[0]} />

            <CompareSeedsPlayer color={playerColors[1]}>
              <PlayerColumn isBold={isWinner(data.playerB.aggregate.sum.score)}>{playerB}</PlayerColumn>
              <TurnsColumn></TurnsColumn>
              <TimeColumn></TimeColumn>
              <RuneColumn></RuneColumn>
              <ScoreColumn>
                <Score>{data.playerB.aggregate.sum.score}</Score>
              </ScoreColumn>
            </CompareSeedsPlayer>
            <ScoreRatioVisual ratio={data.playerB.aggregate.sum.score / maxScore} color={playerColors[1]} />
          </CompareSeedsRowContent>
        </CompareSeedsRow>

        <TotalDivider />

        {/* for each seed */}
        {comparedSeeds.map((seed) => {
          const eventHandlers = isTouch
            ? {
                onClick: () => set_details(seed.id),
              }
            : {
                onMouseEnter: () => set_details(seed.id),
                onMouseLeave: () => set_details(null),
              };

          return (
            <div key={seed.id} {...eventHandlers}>
              <CompareSeed seed={seed} simple={seed.id !== details} />
            </div>
          );
        })}
      </CompareSeeds>
    </Container>
  );
}

function CompareSeed({ simple, seed }) {
  const { players, maxScore } = seed;

  return (
    <CompareSeedsRow>
      <CompareSeedsRowContent>
        {simple ? null : (
          <div>
            {seed.species} {seed.background}
          </div>
        )}
        {players.map((player, i) => {
          const isWinner = maxScore === player.score;
          const scoreRatio = maxScore >= 0 ? player.score / maxScore : 0;

          const turnsPerSecond = player.timeSeconds ? player.turns / player.timeSeconds : 0;

          if (simple) {
            return <ScoreRatioVisual key={player.name} ratio={scoreRatio} color={playerColors[i]} />;
          }

          return (
            <Link key={player.name} href={player.morgue} rel="noopener" target="_blank">
              <CompareSeedsPlayer key={player.name} color={isWinner ? playerColors[i] : loserColor}>
                <PlayerColumn>{player.name}</PlayerColumn>
                <TurnsColumn>{turnsPerSecond.toFixed(2)}</TurnsColumn>
                <TimeColumn>
                  <Time>{player.timeSeconds}</Time>
                </TimeColumn>
                <RuneColumn>{player.runeCount}</RuneColumn>
                <ScoreColumn>
                  <Score>{player.score}</Score>
                </ScoreColumn>
              </CompareSeedsPlayer>
            </Link>
          );
        })}

        {/* {simple ? null : <SeedInfo seed={seed} />} */}
      </CompareSeedsRowContent>
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

function ScoreRatioVisual({ ratio, color }) {
  return <ScoreRatioVisualContainer width={ratio * 100} color={color}></ScoreRatioVisualContainer>;
}

const ScoreRatioVisualContainer = styled.div`
  width: ${(props) => props.width}%;
  height: 8px;
  background-color: ${(props) => props.color};
`;

const scoreFormatter = new Intl.NumberFormat('en');

function Score(props) {
  return scoreFormatter.format(props.children);
}

function Time(props) {
  return new Date(props.children * 1000).toISOString().substr(11, 8);
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
  margin: 16px 0;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
`;

const CompareSeedsRowContent = styled.div`
  padding: 0 16px;
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

const TurnsColumn = styled.div`
  flex: 0.2;
  font-variant: tabular-nums;
`;

const TimeColumn = styled.div`
  flex: 0.2;
  font-variant: tabular-nums;
`;

const RuneColumn = styled.div`
  flex: 0.1;
  font-variant: tabular-nums;
`;

const ScoreColumn = styled.div`
  flex: 0.2;
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
