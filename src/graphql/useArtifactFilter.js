import * as React from 'react';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client';

import { UNRANDS } from 'src/utils/Unrands';

// TODO parse all unrands from crawl source
// see scripts/getMonster.js and make equivalent for
// https://github.com/crawl/crawl/tree/master/crawl-ref/source/dat/descript/unrand.txt
// since we support many versions we should add to our list from each version
// e.g. for 0.27-0.29 get all uniques and create a unique set from all 3 lists

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
export function useArtifactFilter(props) {
  const [filter_list, set_filter_list] = React.useState([
    // represent top level (no filter)
    create_filter_entry(null, props.artifact_list),
  ]);

  const client = useApolloClient();

  async function add_filter(i) {
    console.debug('[useArtifactFilter]', 'filter', { i });

    let query;

    // first filter, top level seedVersion query
    if (filter_list.length === 1) {
      query = gql`
        query FilterArtifactSearch {
          ${result_key(i)}: dcsseeds_scrapePlayers_seedVersion(
            where: { items: { name: { _ilike: "${ilike(i)}" } } }
            order_by: { items_aggregate: { count: desc } }
          ) {
            ${UnrandQuery}
          }
        }

        ${ResultFragment}
      `;
    } else {
      const [, first_filter, ...rest_filter] = filter_list;
      const nested_filter = [...rest_filter, create_filter_entry(i)];

      query = gql`
        query FilterArtifactSearch {
          ${result_key(first_filter.i)}: dcsseeds_scrapePlayers_seedVersion(
            where: { items: { name: { _ilike: "${ilike(first_filter.i)}" } } }
            order_by: { items_aggregate: { count: desc } }
          ) {
            ${NestedFilter(nested_filter, UnrandQuery)}
          }
        }

        ${ResultFragment}
      `;
    }

    const fetchPolicy = 'cache-first';
    const result = await client.query({ query, fetchPolicy });
    console.debug('[useArtifactFilter]', 'filter', { result });

    set_filter_list((L) => [...L, create_filter_entry(i, result.data)]);
  }

  // build result list given current filter list
  const result_list = [];

  if (filter_list.length > 1) {
    const last_filter = filter_list[filter_list.length - 1];
    const path = filter_list.slice(1).map((filter_entry) => result_key(filter_entry.i));
    traverse_data(last_filter.data, path, onVisit);
  }

  function onVisit(node, path) {
    // console.debug('visit', { node, path });
    const { seed, version } = node;
    const item_list = [];
    for (const key of path) {
      const [item] = node[key];
      item_list.push(item);
    }
    result_list.push({ item_list, seed, version });
  }

  function traverse_data(node, path, onVisit, i = 0) {
    if (i === path.length) {
      onVisit(node, path);
      return;
    }

    const key = path[i];
    const node_list = node[key];

    if (!Array.isArray(node_list)) {
      return;
    }

    // console.debug({ node, path, i, key, node_list });

    for (const nested_node of node_list) {
      const next_node = nested_node?.seedVersion || nested_node;
      traverse_data(next_node, path, onVisit, i + 1);
    }
  }

  return { filter_list, add_filter, result_list };
}

const safe_name = (value) => value.replace(/"/g, '\\"');
const ilike = (i) => `%${safe_name(UNRANDS[i])}%`;
const result_key = (i) => `result_${i}`;
const create_filter_entry = (i, data) => ({ i, data });

const UnrandQuery = `
  seed
  version
  ${UNRANDS.map(KeyedItemsResult)}
`;

function KeyedItemsResult(_, i) {
  const key = result_key(i);

  return `
    ${key}: items(where: { name: { _ilike: "${ilike(i)}" } }, limit: 1, order_by: { branch: { order: asc } }) {
      ...Result
    }
  `;
}

function NestedFilter(filter_list, unrand_query) {
  let nested_query = unrand_query;

  for (let i = 0; i < filter_list.length; i++) {
    // walk backwards wrapping inner queries
    const filter_entry = filter_list[filter_list.length - 1 - i];

    const key = result_key(filter_entry.i);
    const filter_ilike = ilike(filter_entry.i);

    nested_query = `
      ${key}: items(where: { name: { _ilike: "${filter_ilike}" } }, limit: 1, order_by: { branch: { order: asc } }) {
        seedVersion {
          ${nested_query}
        }
      }
    `;
  }

  return nested_query;
}

const ResultFragment = gql`
  fragment Result on dcsseeds_scrapePlayers_item {
    name
    branchName
    level
    morgue
  }
`;
