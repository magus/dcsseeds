import * as React from 'react';
import styled from 'styled-components';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import CopyButton from 'src/components/CopyButton';
import Username from 'src/components/Username';

const SUBMIT_API = (morgue) => `/api/submit?morgue=${morgue}`;

export default function Home(props) {
  const instance = React.useRef({
    input: React.createRef(),
  });
  const [inputValue, set_inputValue] = React.useState('');
  const { loading, error, data } = useQuery(RECENT_SEEDS_GQL);

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading...</LoadingText>
      </Container>
    );
  }

  const handleSubmit = () => {
    fetch(SUBMIT_API(inputValue))
      .then((resp) => resp.text())
      .then((text) => console.warn('SUBMIT_API', { text }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const input = instance.current.input.current;
      if (input) {
        // ensure input loses focus on search click
        input.blur();
      }
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    if (!value) {
      set_inputValue('');
    } else {
      set_inputValue(value);
    }
  };

  return (
    <Container>
      <SubmitForm action="#">
        <SubmitInput
          value={inputValue}
          placeholder="http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt"
          ref={instance.current.input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSubmit}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="none"
        />
        <button onClick={handleSubmit}>Submit</button>
      </SubmitForm>

      <RecentSeeds>
        {data.recentSeeds.map((seedRow) => {
          return (
            <SeedRow key={seedRow.id}>
              <Timestamp>{seedRow.created}</Timestamp>
              {seedRow.species} {seedRow.background}
              <CopyButton>{seedRow.value}</CopyButton>
              <div>
                {seedRow.players.map((player, i) => {
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
      version
      species
      background
      players(limit: 5, order_by: { score: desc }) {
        name
        score
        morgue
      }
    }
  }
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

const SubmitForm = styled.form`
  width: 100%;
`;

const SubmitInput = styled.input`
  line-height: 36px;
  width: 100%;
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

const PlayerSpacer = styled.span`
  width: 4px;
  display: inline-block;
`;
