import * as React from 'react';
import styled, { css } from 'styled-components';
import { useRouter } from 'next/router';

import * as ScrapePlayers from 'src/graphql/scrapePlayers';

import * as Spacer from 'src/components/Spacer';
import { SearchField } from './SearchField';
import { ArtifactSearch } from './ArtifactSearch';
import { SearchResults } from './SearchResults';
import { RandomSearchCTA } from './RandomSearchCTA';
import { random_placeholder } from '../random_placeholder';

export function ItemSearch(props) {
  const router = useRouter();

  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState('');
  const itemSearch = ScrapePlayers.useItemSearch();

  const [placeholder, set_placeholder] = React.useState(undefined);
  React.useEffect(() => {
    set_placeholder(random_placeholder());
  }, []);

  React.useEffect(() => {
    if (!router.isReady) return;

    if (router.query.q && search !== router.query.q) {
      set_search(router.query.q);
    }

    // intentionally run once after router is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

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
      url.query = {
        // ensure we do not clear other query params
        ...router.query,
        q: search,
      };
    }

    // Shallow routing allows you to change the URL without running data fetching methods again,
    // that includes getServerSideProps, getStaticProps, and getInitialProps.
    // https://nextjs.org/docs/routing/shallow-routing
    router.replace(url, undefined, { shallow: true });

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

  const formattedTotalItemCount = format_number.format(props.totalItemCount);
  const results = itemSearch.latestResults(search);

  // console.debug('[Search]', { results, itemSearch });

  return (
    <Container>
      <TotalItems>
        Search over <strong>{formattedTotalItemCount}</strong> items...
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

      {/* hide cta when artifact filter is active */}
      {router.query.a ? null : <RandomSearchCTA search={search} onTrySearch={handleTrySearch} />}

      <ArtifactSearch key="ArtifactSearch" {...props} />

      <Spacer.Vertical size="2" />

      {/* hide results when artifact filter is active */}
      {router.query.a ? null : <SearchResults loading={itemSearch.loading} search={search} results={results} />}
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
