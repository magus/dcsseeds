import * as React from 'react';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';

import CopyButton from 'src/components/CopyButton';
import StyledLink from 'src/components/StyledLink';
import Timestamp from 'src/components/Timestamp';
import Username from 'src/components/Username';

import * as GraphqlSeed from 'src/graphql/seed';

export default function SeedList(props) {
  const { seeds, withHomeStyle } = props;

  const [hideMutation, hideSeedMutation] = useMutation(GraphqlSeed.HIDE_SEED.query);
  const handleDelete = (id) => () => hideMutation({ variables: { id } });

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
                const content = withHomeStyle ? (
                  player.name
                ) : (
                  <Username inline url={player.morgue}>
                    {player.name} ({player.score})
                  </Username>
                );

                return (
                  <React.Fragment key={player.name}>
                    <PlayerName>{content}</PlayerName>
                  </React.Fragment>
                );
              })}
            </div>
            <pre>{seedRow.notes}</pre>
            {players.length < 2 || !withHomeStyle ? null : <button onClick={handleDelete(seedRow.id)}>Complete</button>}
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
  border: 1px solid var(--button-border-color);
  padding: 12px 24px;
  display: flex;
  flex-direction: column;
  margin: 24px 0;
  > * {
    margin: 8px 0;
  }
`;

const PlayerName = styled.span`
  margin: 0 4px 0 0;
  display: inline-block;
`;
