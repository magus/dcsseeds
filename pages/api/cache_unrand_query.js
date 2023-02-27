import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import send from 'src/server/zeitSend';
import * as Unrands from 'src/utils/Unrands';

if (!process.env.HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// Example API Request
// http://localhost:3000/api/cache_unrand_query?window_size=25

export default async function handler(req, res) {
  const stopwatch = new Stopwatch();
  const window_size = Number(req.query.window_size);

  try {
    if (isNaN(window_size)) {
      throw new Error('Must provide [window_size]');
    }

    // perform queries for set of oldest (stale) cache entries
    const stale_unrand_list = await GQL_CacheUnrandOldest.run({ window_size });

    const unrand_query = serverQuery(gql`
      query UnrandQueryRange {
        ${stale_unrand_list.map((unrand, i) => SeedVersionFilter(unrand))}
      }

      ${ResultFragment}
    `);

    const query_result = await unrand_query.run();

    const cache_list = [];

    for (const unrand_key of Object.keys(query_result)) {
      const result_list = query_result[unrand_key];
      cache_list.push({ unrand_key, result_list });
    }

    const cache_result = await GQL_CacheUnrandResultList.run({ cache_list });
    const time_ms = stopwatch.stop();
    const data = { time_ms, cache_result };
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
      }
    }
  `,
  (data) => {
    const cache_list = data.dcsseeds_scrapePlayers_unrand_cache;
    const unrand_list = cache_list.map((entry) => Unrands.ById[entry.unrand_key]);
    return unrand_list;
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

const ResultFragment = gql`
  fragment Result on dcsseeds_scrapePlayers_item {
    name
    branchName
    level
    morgue
  }
`;

function SeedVersionFilter(unrand) {
  const name_ilike = `%${safe_name(unrand.name)}%`;
  const key = unrand.id;

  return `
    ${key}: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "${name_ilike}" } } }
    ) {
      seed
      version
      items(where: { name: { _ilike: "${name_ilike}" } }, limit: 1, order_by: { branch: { order: asc } }) {
        ...Result
      }
    }`;
}

function Stopwatch() {
  const start_time = process.hrtime();

  function stop(unit = 'ms') {
    const hrtime = process.hrtime(start_time);

    switch (unit) {
      case 'ms':
        return hrtime[0] * 1e3 + hrtime[1] / 1e6;
      case 'micro':
        return hrtime[0] * 1e6 + hrtime[1] / 1e3;
      case 'nano':
      default:
        return hrtime[0] * 1e9 + hrtime[1];
    }
  }

  return { stop };
}