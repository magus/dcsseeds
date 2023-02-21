import * as React from 'react';
import styled from 'styled-components';

import * as ScrapePlayers from 'src/graphql/scrapePlayers';

import * as Spacer from 'src/components/Spacer';
import { SearchField } from './SearchField';
import * as QueryParams from '../hooks/QueryParams';
import { ArtifactSearch } from './ArtifactSearch';
import { SearchResults } from './SearchResults';
import { RandomSearchCTA } from './RandomSearchCTA';
import { random_placeholder } from '../random_placeholder';

export function ItemSearch(props) {
  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState('');
  const itemSearch = ScrapePlayers.useItemSearch();

  const [placeholder, set_placeholder] = React.useState(undefined);
  React.useEffect(() => {
    set_placeholder(random_placeholder());
  }, []);

  React.useEffect(() => {
    // fire off search query
    if (search) {
      itemSearch.search(search);
    }

    // intentionally run only when search query changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    set_search(placeholder);
  }

  function handle_query(query) {
    set_search(query.q || '');
  }

  const formatted_total_item_count = format_number.format(props.total_item_count);
  const results = itemSearch.latestResults(search);

  // console.debug('[Search]', { results, itemSearch, search });

  return (
    <Container>
      <QueryParams.Sync
        onChange={handle_query}
        params={{
          q: ['string', search],
        }}
      />

      <TotalItems>
        Search over <strong>{formatted_total_item_count}</strong> items...
      </TotalItems>

      <SearchField
        ref={searchFieldRef}
        label="Search"
        placeholder={placeholder}
        value={search}
        onSubmit={handleSubmit}
        onClear={handleClear}
        onChange={handleChange}
      />

      <Spacer.Vertical size="2" />

      <RandomSearchCTA search={search} onTrySearch={handleTrySearch} />

      <ArtifactSearch key="ArtifactSearch" {...props} />

      <Spacer.Vertical size="2" />

      <SearchResults loading={itemSearch.loading} search={search} results={results} />
    </Container>
  );
}

const Container = styled.div`
  max-width: 720px;
  width: 100%;
`;

const TotalItems = styled.div`
  font-size: var(--font-small);
  padding: var(--spacer-1) 0;
`;

const format_number = new Intl.NumberFormat();
