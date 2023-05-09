import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import send from 'src/server/zeitSend';
import * as Unrands from 'src/utils/Unrands';
import { Stopwatch } from 'src/server/Stopwatch';

// Example API Request
// http://localhost:3000/api/cache_unrand_query?window_size=25

export default async function handler(req, res) {
  const stopwatch = new Stopwatch();
  const window_size = Number(req.query.window_size);
  const report = {};

  try {
    if (isNaN(window_size)) {
      throw new Error('Must provide [window_size]');
    }

    // perform queries for set of oldest (stale) cache entries
    report.stale_cache_entry = await GQL_CacheUnrandOldest.run({ window_size: 1 });

    stopwatch.record('fetch stale cache rows');

    // build window from most stale unrand cache entry
    report.update_list = [];
    const stale_unrand = Unrands.ById[report.stale_cache_entry.unrand_key];
    for (let i = 0; i < window_size; i++) {
      const wrapped_index = (i + stale_unrand.i) % Unrands.List.length;
      const unrand = Unrands.Metadata[wrapped_index];
      report.update_list.push(unrand.id);
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
    return send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return send(res, 500, err, { prettyPrint: true });
  }
}

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
