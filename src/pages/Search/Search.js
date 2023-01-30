import * as React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { SearchField } from './components/SearchField';
import { SearchResults } from './components/SearchResults';
import * as ScrapePlayers from 'src/graphql/scrapePlayers';

// TODO parse all unrands from crawl source
// see scripts/getMonster.js and make equivalent for
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/dat/descript/unrand.txt
// since we support many versions we should add to our list from each version
// e.g. for 0.27-0.29 get all uniques and create a unique set from all 3 lists

// TODO handle AND queries
// find seeds with artifact combos
// build programmatically by creating every artifact query nested under every other
// then we can build a ui to filter by artifact presence
// and at each level we can show which other artifacts are available
//
// e.g.
//    for each result.wyrmbane
//    result.wyrmbane.warlock.length, count it
//    total count = number of seeds with wrymbane AND warlock mirror
//
// top level query show count for each unrand
gql`
  query MyQueryA {
    wyrmbane: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "%wyrmbane%" } } }
      order_by: { items_aggregate: { count: desc } }
    ) {
      seed
      version
    }
    warlock: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "%warlock%" } } }
      order_by: { items_aggregate: { count: desc } }
    ) {
      seed
      version
    }
    spriggan: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "%spriggan%" } } }
      order_by: { items_aggregate: { count: desc } }
    ) {
      seed
      version
    }
  }

  fragment Result on dcsseeds_scrapePlayers_item {
    branchName
    level
  }
`;

// query to filter for combined artifacts
// display pill for each artifact (make it a grid so each cell is same size, e.g. 3x30 or 4x30, etc.)
// select pill to toggle 'AND artifact'
// after each pill selection, build and run the nested query and update counts for all artifacts
//    -> select (wymbane 6)
//       *query wymbane > nested artifacts
//       *update counts so all other counts should go down but wymbane should stay at 50
//       *show results for wymbane
//       -> select (warlock's mirror 2)
//          *query wymbane > warlocks > nested artifacts
//          *update counts so all other counts should go down but wymbane and warlocks should stay at 2
//          *show results for wymbane + warlocks
//
gql`
  query MyQueryA {
    wyrmbane: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "%wyrmbane%" } } }
      order_by: { items_aggregate: { count: desc } }
    ) {
      seed
      version
      wyrmbane: items(where: { name: { _ilike: "%wyrmbane%" } }) {
        ...Result
        seedVersion {
          warlock: items(where: { name: { _ilike: "%warlock%" } }) {
            ...Result
            seedVersion {
              spriggan: items(where: { name: { _ilike: "%spriggan%" } }) {
                ...Result
              }
            }
          }
        }
      }
    }
  }

  fragment Result on dcsseeds_scrapePlayers_item {
    branchName
    level
  }
`;

//
// alternatively the top level query can be filtered by using _in filter with array of seed identifiers
// requires updating seedVersion table with unique identifier for _in query
// for example for a wymrbane query with 4 seed versions
//
//
//     gql`
//       query MyQueryA {
//         dcsseeds_scrapePlayers_seedVersion(
//           where: {
//             seed: { _in: ["2138692063163957027", "4770158223621261664", "16086881908306480364", "11675607203939162522"] }
//           }
//         ) {
//           wyrmbane: items(where: { name: { _ilike: "%wyrmbane%" } }) {
//             ...Result
//           }
//           warlock: items(where: { name: { _ilike: "%warlock%" } }) {
//             ...Result
//           }
//           spriggan: items(where: { name: { _ilike: "%spriggan%" } }) {
//             ...Result
//           }
//         }
//       }
//     `;
//
//

export default function Search(props) {
  const router = useRouter();
  const { q } = router.query;
  const searchFieldRef = React.useRef();
  const [search, set_search] = React.useState(q || '');
  const itemSearch = ScrapePlayers.useItemSearch();

  React.useEffect(() => {
    itemSearch.search(search);
    // intentionally run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
