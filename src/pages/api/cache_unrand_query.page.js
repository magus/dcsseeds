import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import send from 'src/server/zeitSend';
import * as Unrands from 'src/utils/Unrands';
import { Stopwatch } from 'src/server/Stopwatch';
import { error_json } from 'src/utils/error_json';

//
// API endpoint for updating the cache of unrand query results
//
// Example API Request
//
//   curl -v "http://localhost:3000/api/cache_unrand_query?window_size=5"
//
// Increase window_size to 25 for very long request which will update the more entries at once
//
export default async function handler(req, res) {
  const stopwatch = new Stopwatch();
  const window_size = Number(req.query.window_size);
  const report = {};

  try {
    if (isNaN(window_size)) {
      throw new Error('Must provide [window_size]');
    }

    // check for missing unrand cache keys first
    const all_cache_set = await stopwatch.time(GQL_AllCacheKeySet.run()).record('all unrand cache keys');

    report.update_list = [];

    // find values in `Unrands.Metadata` that are not in `all_cache_keys` by `id`
    const missing_keys = Unrands.Metadata.filter((unrand) => !all_cache_set.has(unrand.id));
    report.missing_keys = missing_keys.map((unrand) => unrand.id);

    if (missing_keys.length) {
      // build window from missing keys
      // add missing keys to report.update_list up to window_size
      const include_count = Math.min(window_size, missing_keys.length);
      for (let i = 0; i < include_count; i++) {
        report.update_list.push(missing_keys[i].id);
      }
    } else {
      // perform queries for set of oldest (stale) cache entries
      report.stale_cache_entry = await GQL_CacheUnrandOldest.run({ window_size: 1 });

      stopwatch.record('fetch stale cache rows');

      // build window from most stale unrand cache entry
      const stale_unrand = Unrands.ById[report.stale_cache_entry.unrand_key];
      for (let i = 0; i < window_size; i++) {
        const wrapped_index = (i + stale_unrand.i) % Unrands.List.length;
        const unrand = Unrands.Metadata[wrapped_index];
        report.update_list.push(unrand.id);
      }
    }

    const GQL_UnrandQueryResults = serverQuery(gql`
      query UnrandQueryRange {
        ${report.update_list.map((unrand_key) => {
          const unrand = Unrands.ById[unrand_key];
          return SeedVersionFilter(unrand);
        })}
      }

      fragment UnrandResult on dcsseeds_scrapePlayers_item {
        name
        branchName
        level
        seed
        version
      }
    `);

    const query_result = await stopwatch.time(GQL_UnrandQueryResults.run()).record('calculate unrand results');

    const cache_list = [];

    for (const unrand_key of Object.keys(query_result)) {
      const result_list = query_result[unrand_key];
      cache_list.push({ unrand_key, result_list });
    }

    const cache_result = await stopwatch
      .time(GQL_CacheUnrandResultList.run({ cache_list }))
      .record('write results to cache');

    const times = stopwatch.list();
    const data = { times, cache_result, report };
    return await send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    const times = stopwatch.list();
    const error = error_json(err);
    const data = { times, error, report };
    return await send(res, 500, data, { prettyPrint: true });
  }
}

const GQL_AllCacheKeySet = serverQuery(
  gql`
    query AllUnrandCacheKeys {
      keys: dcsseeds_scrapePlayers_unrand_cache {
        unrand_key
      }
    }
  `,
  (data) => {
    const key_entry_list = data.keys;
    const key_list = key_entry_list.map((entry) => entry.unrand_key);
    return new Set(key_list);
  },
);

const GQL_CacheUnrandOldest = serverQuery(
  gql`
    query CacheUnrandOldest($window_size: Int!) {
      dcsseeds_scrapePlayers_unrand_cache(limit: $window_size, order_by: { updated_at: asc }) {
        unrand_key
        updated_at
      }
    }
  `,
  (data) => {
    const cache_list = data.dcsseeds_scrapePlayers_unrand_cache;
    const [oldest_entry] = cache_list;
    return oldest_entry;
  },
);

const GQL_CacheUnrandResultList = serverQuery(gql`
  mutation CacheUnrandResultList($cache_list: [dcsseeds_scrapePlayers_unrand_cache_insert_input!]!) {
    insert_dcsseeds_scrapePlayers_unrand_cache(
      objects: $cache_list
      on_conflict: { constraint: dcsseeds_scrapePlayers_unrand_cache_pkey, update_columns: result_list }
    ) {
      affected_rows
    }
  }
`);

const safe_name = (value) => value.replace(/"/g, '\\"');

function SeedVersionFilter(unrand) {
  const name_ilike = `%${safe_name(unrand.name)}%`;
  const key = unrand.id;

  return `
    ${key}: dcsseeds_scrapePlayers_item_search_name(args: {search_name: "${name_ilike}"}) {
      ...UnrandResult
    }`;
}
