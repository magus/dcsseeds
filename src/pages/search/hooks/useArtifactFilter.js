import * as React from 'react';
import { gql, useApolloClient } from '@apollo/client';

import * as Unrands from 'src/utils/Unrands';

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

  // build a lookup for the top-level artifact counts to quickly count
  // results for artifact_count array below
  const [seedVersion_set_list, seedVersion_item_map, version_seed_map, version_item_map, filtered_artifact_list] =
    React.useMemo(() => {
      // store the entire artifact_list filtered by branch filter
      const filtered_artifact_list = [];

      const seedVersion_set_list = [];
      const seedVersion_item_map = new Map();

      // { [version]: Set(seedVersion) } for each version store seedVersion set
      const version_seed_map = new Map();

      // { [version]: [count, count, ...] } for each version store count
      const version_item_map = new Map();

      // initialize version maps for all versions
      for (const version of props.version_list) {
        version_seed_map.set(version, new Set());
        version_item_map.set(version, []);
      }

      for (let i = 0; i < Unrands.List.length; i++) {
        // init item count for each version
        for (const version of props.version_list) {
          version_item_map.get(version)[i] = 0;
        }

        // init artifact_list for this unrand
        filtered_artifact_list[i] = [];

        const result_list = props.artifact_list[i];

        const item_seedVersion_set = new Set();

        for (const result of result_list) {
          const seedVersion = seed_version_key(result.seed, result.version);

          // always store this unrand for this seed
          const seedVersion_item_list = seedVersion_item_map.get(seedVersion) || [];
          seedVersion_item_list.push({ ...result, unrand_key: i });
          seedVersion_item_map.set(seedVersion, seedVersion_item_list);

          // skip if we are filtering this branch
          if (DEFAULT_BRANCH_FILTER.has(result.branchName)) {
            // console.debug('skip', { result });
            continue;
          }

          // include this result in overall artifact list
          filtered_artifact_list[i].push(result);

          // store count of this item for this version
          version_item_map.get(result.version)[i]++;

          // set the seedVersion key in the version lookup
          version_seed_map.get(result.version).add(result.seed);

          // store seed version for this unrand
          item_seedVersion_set.add(seedVersion);
        }

        seedVersion_set_list[i] = item_seedVersion_set;
      }

      // console.debug('[build memoized seedVersion data structures]', {
      //   seedVersion_set_list,
      //   seedVersion_item_map,
      //   version_seed_map,
      //   version_item_map,
      // });

      return [seedVersion_set_list, seedVersion_item_map, version_seed_map, version_item_map, filtered_artifact_list];
    }, [props.artifact_list, props.version_list]);

  function init_state() {
    const filter_list = [];
    const version_set = new Set();

    return {
      loading: false,
      version_set,
      filter_list,
      result_list: [],
      ...get_counts([], {
        version_set,
        seedVersion_set_list,
        seedVersion_item_map,
        version_seed_map,
        version_item_map,
      }),
    };
  }

  const [state, patch_state] = React.useReducer(
    (state, action) => {
      return { ...state, ...action };
    },
    undefined,
    init_state,
  );

  // generate unique set of filters from list
  // also calculate a unique key identifying this combination
  const filter_set = new Set(state.filter_list);

  const api = {
    ...state,
    filter_set,
    reset,
    sync,
    add_filter,
    remove_filter,
    add_version,
    remove_version,
  };

  // console.debug('[useArtifactFilter]', api);

  return api;

  async function reset() {
    return patch_state(init_state());
  }

  async function sync(args) {
    let version_set = new Set();
    let filter_list = [];

    if (Array.isArray(args.filter_list)) {
      for (const name of args.filter_list) {
        const i = Unrands.NameIndex[name];
        if (typeof i === 'number') {
          filter_list.push(i);
        }
      }
    }

    if (Array.isArray(args.version_list)) {
      version_set = new Set(args.version_list);
    }

    await query_next_filter({ version_set, filter_list });
  }

  async function add_version(version) {
    const version_set = new Set(state.version_set);
    version_set.add(version);
    await set_version(version_set);
  }

  async function remove_version(version) {
    const version_set = new Set(state.version_set);
    version_set.delete(version);
    await set_version(version_set);
  }

  async function set_version(version_set) {
    await query_next_filter({ version_set });
  }

  async function remove_filter(artifact_i) {
    if (artifact_i >= Unrands.List.length) {
      console.warn('cannot filter unrecognized', { artifact_i });
      return;
    }

    // console.debug('[useArtifactFilter]', 'remove_filter', { artifact_i });
    const filter_list = state.filter_list.filter((i) => i !== artifact_i);
    await query_next_filter({ filter_list });
  }

  async function add_filter(artifact_i) {
    if (artifact_i >= Unrands.List.length) {
      console.warn('cannot filter unrecognized', { artifact_i });
      return;
    }

    // console.debug('[useArtifactFilter]', 'add_filter', { artifact_i });
    const filter_list = [...state.filter_list, artifact_i];
    await query_next_filter({ filter_list });
  }

  async function query_next_filter(args) {
    patch_state({ loading: true });

    // pull both args from state to ensure the missing
    // arg is properly passed when it's missing from args
    const { version_set, filter_list } = state;
    const full_args = { version_set, filter_list, ...args };

    try {
      let query_result = await run_query_filter({
        client,
        ...full_args,
        filtered_artifact_list,
        seedVersion_set_list,
        seedVersion_item_map,
        version_seed_map,
        version_item_map,
      });

      patch_state({ loading: false, ...args, ...query_result });
    } catch (error) {
      patch_state({ loading: false });
      throw error;
    }
  }
}

function get_counts(result_list, args) {
  const artifact_count = [];

  for (let i = 0; i < Unrands.List.length; i++) {
    artifact_count[i] = 0;

    const seedVersion_set = args.seedVersion_set_list[i];

    if (result_list.length === 0) {
      if (args.version_set.size === 0) {
        artifact_count[i] = seedVersion_set.size;
      } else {
        for (const version of Array.from(args.version_set)) {
          const version_item_list = args.version_item_map.get(version);
          artifact_count[i] += version_item_list[i];
        }
      }
    } else {
      for (const result of result_list) {
        if (seedVersion_set.has(seed_version_key(result.seed, result.version))) {
          if (args.version_set.size === 0) {
            artifact_count[i]++;
          } else if (args.version_set.has(result.version)) {
            artifact_count[i]++;
          }
        }
      }
    }
  }

  const version_count = new Map();

  for (const version of Array.from(args.version_seed_map.keys())) {
    let count = 0;
    const seed_set = args.version_seed_map.get(version);

    if (result_list.length === 0) {
      count += Array.from(seed_set).length;
    } else {
      for (const result of result_list) {
        if (seed_set.has(result.seed)) {
          count++;
        }
      }
    }

    version_count.set(version, count);
  }

  return { artifact_count, version_count };
}

// 'graphql' | 'local'
// const QUERY_FILTER_TYPE = 'graphql';
const QUERY_FILTER_TYPE = 'local';

async function run_query_filter(args) {
  const unfiltered_result_list = await (async function () {
    switch (QUERY_FILTER_TYPE) {
      case 'graphql':
        return await graphql_filter(args);
      case 'local':
      default:
        return await local_filter(args);
    }
  })();

  const counts = get_counts(unfiltered_result_list, args);

  // filter result_list by state.version_set
  const result_list = unfiltered_result_list.filter((result) => {
    if (args.version_set.size === 0) {
      return true;
    }

    return args.version_set.has(result.version);
  });

  return { result_list, ...counts };
}

async function local_filter(args) {
  const { filter_list } = args;

  if (filter_list.length === 0) {
    // handle initial case with query result from static props
    return [];
  }

  // first collect seeds and item matches into an array of results
  const seed_map = new Map();

  for (const unrand_key of filter_list) {
    const unrand_list = args.filtered_artifact_list[unrand_key];

    for (const result of unrand_list) {
      const { seed, version } = result;
      const seed_key = seed_version_key(seed, version);

      const seed_result = seed_map.get(seed_key) || {
        seed,
        version,
        all_item_list: args.seedVersion_item_map.get(seed_key),
        item_list: [],
      };

      seed_result.item_list.push({ ...result, unrand_key });

      seed_map.set(seed_key, seed_result);

      // console.debug({ unrand_key, seed_key, seed_result });
    }
  }

  // console.debug({ seed_map });

  // now filter the lists that have all the filtered items
  let result_list = [];

  for (const seed_result of seed_map.values()) {
    if (seed_result.item_list.length === filter_list.length) {
      result_list.push(seed_result);
    }
  }

  return result_list;
}

async function graphql_filter(args) {
  const { filter_list } = args;

  if (filter_list.length === 0) {
    // handle initial case with query result from static props
    return [];
  }

  // build result list given current filter list
  let result_list = [];

  const nested_query = active_filter_query();
  const [first_filter, ...rest_filter] = filter_list;
  const first_filter_ilike = ilike(first_filter);

  const query = gql`
      query FilterArtifactSearch {
        ${result_key(first_filter)}: dcsseeds_scrapePlayers_seedVersion(
          where: { items: { name: { _ilike: "${first_filter_ilike}" } } }
          order_by: { items_aggregate: { count: desc } }
        ) {
          ${NestedFilter(rest_filter, nested_query)}
        }
      }

      fragment NestedUnrandResult on dcsseeds_scrapePlayers_item {
        name
        branchName
        level
      }
    `;

  const fetchPolicy = 'cache-first';
  const query_result = await args.client.query({ query, fetchPolicy });
  // console.debug('[useArtifactFilter]', 'graphql_filter', { query_result });

  result_list = traverse_data(query_result.data, filter_list, handle_result);

  return result_list;
}

function handle_result(node, filter_list) {
  const { seed, version } = node;

  const item_list = [];
  const all_item_list = [];

  for (const unrand_key of filter_list) {
    const [item] = node[result_key(unrand_key)];
    item_list.push({ ...item, unrand_key });
  }

  for (let unrand_key = 0; unrand_key < Unrands.List.length; unrand_key++) {
    const [item] = node[result_key(unrand_key)];
    if (item) {
      all_item_list.push({ ...item, unrand_key });
    }
  }

  // console.debug('visit', { node, filter_list, item_list, all_item_list });

  return { all_item_list, item_list, seed, version };
}

function traverse_data(node, filter_list, handle_result, i = 0, result_list = []) {
  if (i === filter_list.length) {
    const result = handle_result(node, filter_list);
    result_list.push(result);
    return;
  }

  const key = result_key(filter_list[i]);
  const node_list = node[key];

  if (!Array.isArray(node_list)) {
    return;
  }

  // console.debug({ node, filter_list, i, key, node_list });

  for (const nested_node of node_list) {
    const next_node = nested_node?.seedVersion || nested_node;
    traverse_data(next_node, filter_list, handle_result, i + 1, result_list);
  }

  return result_list;
}

const safe_name = (value) => value.replace(/"/g, '\\"');
const ilike = (i) => `%${safe_name(Unrands.List[i])}%`;
const result_key = (i) => `result_${i}`;
const seed_version_key = (seed, version) => `${seed}-${version}`;

function active_filter_query() {
  return `
    seed
    version
    ${Unrands.List.map((u, i) => KeyedUnrandResult(i)).join('\n')}
  `;
}

function KeyedUnrandResult(i) {
  const key = result_key(i);
  const name_ilike = ilike(i);

  return `
    ${key}: items(where: { name: { _ilike: "${name_ilike}" } }, limit: 1, order_by: { branch: { order: asc } }) {
      ...NestedUnrandResult
    }
  `;
}

function NestedFilter(filter_list, unrand_query) {
  let nested_query = unrand_query;

  for (let i = 0; i < filter_list.length; i++) {
    // walk backwards wrapping inner queries
    const filter_entry = filter_list[filter_list.length - 1 - i];

    const key = result_key(filter_entry);
    const filter_ilike = ilike(filter_entry);

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

const DEFAULT_BRANCH_FILTER = new Set();
DEFAULT_BRANCH_FILTER.add('Ziggurat');
