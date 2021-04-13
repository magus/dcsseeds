import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { SearchField } from './components/SearchField';
import { SearchResults } from './components/SearchResults';
import * as ScrapePlayers from 'src/graphql/scrapePlayers';

export default function Search(props) {
  const router = useRouter();
  const { q } = router.query;
  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState(q || '');
  const itemSearch = ScrapePlayers.useItemSearch();

  React.useEffect(() => {
    itemSearch.search(search);
  }, []);

  React.useEffect(() => {
    // fire off search query
    if (search) {
      itemSearch.search(search);
    }

    // sync url q= with search term
    const url = {
      pathname: router.pathname,
    };
    if (search) {
      url.query = { q: search };
    }
    router.replace(url);
  }, [search]);

  function handleSubmit() {
    // console.debug('[Search]', 'handleSubmit', { search });
    searchFieldRef.current.blur();
  }

  function handleChange(text) {
    // console.debug('[Search]', 'handleChange', { text });
    set_search(text);
  }

  function handleClear() {
    // console.debug('[Search]', 'handleClear');
    set_search('');
  }

  function handleTrySearch() {
    set_search(props.placeholder);
  }

  const formattedTotalItemCount = new Intl.NumberFormat().format(props.totalItemCount);
  const results = itemSearch.latestResults(search);

  // console.debug('[Search]', { results, itemSearch });

  return (
    <Container>
      <Spacer />

      <TotalItems>
        Search over <strong>{formattedTotalItemCount}</strong> items...
      </TotalItems>

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
      <SearchResults loading={itemSearch.loading} search={search} results={results} onTrySearch={handleTrySearch} />
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

const TotalItems = styled.div`
  font-size: var(--font-small);
  padding: var(--spacer-1) 0;
`;
