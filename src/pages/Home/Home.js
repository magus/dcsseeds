import * as React from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/client';

import Loading from 'src/components/Loading';
import SeedList from 'src/components/SeedList';
import StyledLink from 'src/components/StyledLink';

import * as GraphqlSeed from 'src/graphql/seed';

const SUBMIT_API = (morgue) => `/api/submit?morgue=${morgue}`;

export default function Home(props) {
  const instance = React.useRef({
    input: React.createRef(),
  });

  const [inputValue, set_inputValue] = React.useState('');

  const recentSeedsQuery = useQuery(GraphqlSeed.RECENT_SEEDS.query, {
    // use cache but always refetch on mount
    fetchPolicy: 'cache-and-network',
  });

  const data = GraphqlSeed.RECENT_SEEDS.parse(recentSeedsQuery);

  if (recentSeedsQuery.loading && !data) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  const handleSubmit = () => {
    fetch(SUBMIT_API(inputValue))
      .then((resp) => resp.json())
      .then((json) => {
        // console.debug('SUBMIT_API', { json });
        set_inputValue('');
        recentSeedsQuery.refetch();
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // submit
      handleSubmit();

      // ensure input loses focus on search click
      const input = instance.current.input.current;
      if (input) {
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
          placeholder="Morgue file url e.g. http://crawl..."
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

      <StyledLink href="/new">New Seed</StyledLink>

      <SeedList seeds={data} withHomeStyle />

      <StyledLink href="/history">History</StyledLink>
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

const SubmitForm = styled.form`
  width: 100%;
`;

const SubmitInput = styled.input`
  line-height: 36px;
  width: 100%;
`;
