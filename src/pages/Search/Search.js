import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import * as ScrapePlayers from 'src/graphql/scrapePlayers';
import { useArtifactFilter } from 'src/graphql/useArtifactFilter';

import { SearchField } from './components/SearchField';
import { SearchResults } from './components/SearchResults';
import { random_placeholder } from './random_placeholder';

export default function Search(props) {
  // temporary working on artifact filter
  const artifact_filter = useArtifactFilter(props);
  if (typeof window !== 'undefined') {
    window.artifact_filter = artifact_filter;
  }
  console.debug('[artifact_filter]', artifact_filter);
  // temporary working on artifact filter

  const router = useRouter();
  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState(router.query.q || '');
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
      url.query = { q: search };
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
        placeholder={placeholder}
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
