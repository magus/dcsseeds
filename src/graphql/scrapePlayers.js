import * as React from 'react';
import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client';
import _debounce from 'lodash/debounce';
import _uniqBy from 'lodash/uniqBy';

export function useItemSearch({ limit = 10, delayMs = 250 } = {}) {
  const [searchItems, { loading, data, error, variables }] = useLazyQuery(SEARCH_ITEM_LOCATIONS, {
    // Supported fetch policies
    // https://www.apollographql.com/docs/react/data/queries/#supported-fetch-policies
    fetchPolicy: 'cache-and-network',
  });

  const debouncedSearchItems = React.useMemo(() => {
    return _debounce(searchItems, delayMs);
  }, [searchItems]);

  const allResults = !data || error ? [] : [...data.front, ...data.startWord, ...data.middle];
  const uniqueResults = _uniqBy(allResults, (r) => r.id);
  const results = uniqueResults.slice(0, limit);

  return {
    loading,
    error,
    results,
    latestResults: (search) => {
      if (variables && variables.front === getSearchVariables(search).front) {
        return results;
      }

      return null;
    },
    search: (text) => {
      if (!text) return;

      const orderBy = {
        timestamp: 'desc',
        version: 'desc',
      };

      const variables = {
        ...getSearchVariables(text),
        orderBy,
        limit,
      };

      debouncedSearchItems({ variables });
    },
  };
}

function getSearchVariables(text) {
  return {
    front: `${text}%`,
    startWord: `% ${text}%`,
    middle: `%${text}%`,
  };
}

const SearchResultFragment = gql`
  fragment SearchResult on scrapePlayers_item {
    id
    name
    location
    seed
    version
    morgue
    player {
      name
    }
    timestamp
  }
`;

const SEARCH_ITEM_LOCATIONS = gql`
  ${SearchResultFragment}

  query SearchItemLocations(
    $front: String!
    $startWord: String!
    $middle: String!
    $orderBy: scrapePlayers_item_order_by!
    $limit: Int!
  ) {
    front: scrapePlayers_item(where: { name: { _ilike: $front } }, order_by: [$orderBy], limit: $limit) {
      ...SearchResult
    }
    startWord: scrapePlayers_item(where: { name: { _ilike: $startWord } }, order_by: [$orderBy], limit: $limit) {
      ...SearchResult
    }
    middle: scrapePlayers_item(where: { name: { _ilike: $middle } }, order_by: [$orderBy], limit: $limit) {
      ...SearchResult
    }
  }
`;
