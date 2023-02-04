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
  const client = useApolloClient();

  const [filter_list, set_filter_list] = React.useState([
    // represent top level (no filter)
    create_filter_entry(null, props.artifact_list),
  ]);

  const [first_filter] = filter_list;
  const last_filter = filter_list[filter_list.length - 1];
  const active_filter_list = filter_list.slice(1);
  const filter_path = active_filter_list.map((filter_entry) => result_key(filter_entry.i));

  // build a lookup for the top-level artifact counts to quickly count
  // results for artifact_count array below
  const seedVersion_set_list = React.useMemo(() => {
    const set_list = [];

    for (let i = 0; i < UNRANDS.length; i++) {
      const set = new Set();
      const result_list = first_filter.data[i];

      for (const result of result_list) {
        const key = seed_version_key(result.seed, result.version);
        set.add(key);
      }

      set_list[i] = set;
    }

    return set_list;
  }, [first_filter]);

  // 1. count the number of results for each artifact
  // 2. build result list given current filter list
  let artifact_count = [];
  let result_list = [];

  if (filter_list.length === 1) {
    // handle initial case with query result from static props
    for (let i = 0; i < UNRANDS.length; i++) {
      const seedVersion_set = seedVersion_set_list[i];
      artifact_count[i] = seedVersion_set.size;
    }
  } else if (filter_list.length > 1) {
    result_list = traverse_data(last_filter.data, filter_path, handle_result);

    for (let i = 0; i < UNRANDS.length; i++) {
      artifact_count[i] = 0;

      for (const result of result_list) {
        const seedVersion_set = seedVersion_set_list[i];

        if (seedVersion_set.has(seed_version_key(result.seed, result.version))) {
          artifact_count[i]++;
        }
      }
    }
  }

  return { filter_list, add_filter, artifact_count, seedVersion_set_list, result_list };

  async function add_filter(i) {
    console.debug('[useArtifactFilter]', 'filter', { i });

    const nested_query = active_filter_query([...active_filter_list, create_filter_entry(i)]);

    let query;

    // first filter, top level seedVersion query
    if (filter_list.length === 1) {
      query = gql`
        query FilterArtifactSearch {
          ${result_key(i)}: dcsseeds_scrapePlayers_seedVersion(
            where: { items: { name: { _ilike: "${ilike(i)}" } } }
            order_by: { items_aggregate: { count: desc } }
          ) {
            ${nested_query}
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
            ${NestedFilter(nested_filter, nested_query)}
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
}

const seed_version_key = (seed, version) => `${seed}-${version}`;

function handle_result(node, path) {
  // console.debug('visit', { node, path });
  const { seed, version } = node;

  const item_list = [];

  for (const key of path) {
    const [item] = node[key];
    item_list.push(item);
  }

  return { item_list, seed, version };
}

function traverse_data(node, path, handle_result, i = 0, result_list = []) {
  if (i === path.length) {
    const result = handle_result(node, path);
    result_list.push(result);
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
    traverse_data(next_node, path, handle_result, i + 1, result_list);
  }

  return result_list;
}

const safe_name = (value) => value.replace(/"/g, '\\"');
const ilike = (i) => `%${safe_name(UNRANDS[i])}%`;
const result_key = (i) => `result_${i}`;
const create_filter_entry = (i, data) => ({ i, data });

function active_filter_query(active_filter_list) {
  return `
  seed
  version
  ${active_filter_list.map((filter) => KeyedUnrandResult(filter.i)).join('\n')}
  `;
}

function KeyedUnrandResult(i) {
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
