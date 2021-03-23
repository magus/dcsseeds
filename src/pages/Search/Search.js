import * as React from 'react';
import styled from 'styled-components';

import { SearchField } from './components/SearchField';
import { SearchResults } from './components/SearchResults';
import * as ScrapePlayers from 'src/graphql/scrapePlayers';

export default function Search(props) {
  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState('');
  const itemSearch = ScrapePlayers.useItemSearch();

  React.useEffect(() => {
    itemSearch.search(search);
  }, []);

  function handleSubmit() {
    console.debug('[Search]', 'handleSubmit', { search });
    searchFieldRef.current.blur();
  }

  function handleChange(text) {
    console.debug('[Search]', 'handleChange', { text });
    set_search(text);
    if (text) {
      itemSearch.search(text);
    }
  }

  function handleClear() {
    console.debug('[Search]', 'handleClear');
    set_search('');
  }

  return (
    <Container>
      <Spacer />
      <SearchField
        ref={searchFieldRef}
        label="Search"
        placeholder={props.placeholder}
        value={search}
        onSubmit={handleSubmit}
        onClear={handleClear}
        onChange={handleChange}
      />
      <Spacer />
      <SearchResults loading={itemSearch.loading} search={search} results={itemSearch.latestResults(search)} />
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--spacer-1) var(--spacer-2);
`;

const Spacer = styled.div`
  height: var(--spacer-2);
`;
