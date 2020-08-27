import * as React from 'react';
import styled from 'styled-components';

import CopyButton from 'src/components/CopyButton';
import Timestamp from 'src/components/Timestamp';
import Username from 'src/components/Username';

export default function SeedList(props) {
  const { seeds } = props;

  return (
    <RecentSeeds>
      {seeds.map((seedRow) => {
        const players = seedRow.players;

        return (
          <SeedRow key={seedRow.id}>
            <Timestamp>{seedRow.created}</Timestamp>
            {seedRow.species} {seedRow.background} v{seedRow.version}
            <CopyButton>{seedRow.value}</CopyButton>
            <div>
              {players.map((player, i) => {
                const joiner = i === seedRow.players.length - 1 ? '' : <PlayerSpacer />;

                return (
                  <React.Fragment key={player.name}>
                    <Username inline url={player.morgue}>
                      {player.name} ({player.score})
                    </Username>
                    {joiner}
                  </React.Fragment>
                );
              })}
            </div>
          </SeedRow>
        );
      })}
    </RecentSeeds>
  );
}

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

const PlayerSpacer = styled.span`
  width: 4px;
  display: inline-block;
`;
