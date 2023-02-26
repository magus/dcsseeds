import * as React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

import * as ScrapePlayers from 'src/graphql/scrapePlayers';
import * as Spacer from 'src/components/Spacer';
import { Input } from 'src/components/Input';

import * as QueryParams from '../hooks/QueryParams';
import { ArtifactSearch } from './ArtifactSearch';
import { SearchResults } from './SearchResults';
import { RecentRunLink } from './RecentRunLink';
import { RandomSearchCTA } from './RandomSearchCTA';
import { random_placeholder } from '../random_placeholder';

export function ItemSearch(props) {
  const input_ref = React.useRef();
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

  function handleChange(text) {
    // console.debug('[Search]', 'handleChange', { text });
    set_search(text);
  }

  function handleTrySearch() {
    set_search(placeholder);
  }

  function handle_query(query) {
    set_search(query.q || '');
  }

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
        Search over <strong>{format_number.format(props.total_item_count)}</strong> items...
      </TotalItems>

      <Input
        ref={input_ref}
        icon="🔎"
        aria-label="Filter items and artifacts"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        type="search"
        name="search"
        id="search"
        placeholder={placeholder}
        value={search}
        onChange={handleChange}
        rightContent={<RandomSearchCTA onClick={handleTrySearch} />}
      />

      <Spacer.Vertical size="d2" />

      <RecentRunLink {...props} />

      <Spacer.Vertical size="2" />

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
