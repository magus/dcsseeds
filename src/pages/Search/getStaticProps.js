import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export async function getStaticProps() {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const props = await GQL_SearchStaticProps.run();

  return {
    props,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
    revalidate: 60,
  };
}

const GQL_SEARCH_STATIC_PROPS = gql`
  query SearchStaticProps {
    total_items: dcsseeds_scrapePlayers_item_aggregate {
      aggregate {
        count(columns: id)
      }
    }

    seed_version: dcsseeds_scrapePlayers_seedVersion_aggregate(distinct_on: version) {
      nodes {
        version
      }
    }

    recent_run_list: dcsseeds_scrapePlayers_item(
      limit: 1
      order_by: [{ timestamp: desc }, { morgue: asc }]
      distinct_on: [morgue, timestamp]
    ) {
      timestamp
      seed
      version
      player {
        name
      }
      seedVersion {
        items_aggregate {
          aggregate {
            count
          }
        }
      }
    }

    unrand_cache: dcsseeds_scrapePlayers_unrand_cache {
      result_list
      unrand_key
    }
  }
`;

// debug_gql(GQL_SEARCH_STATIC_PROPS);

const GQL_SearchStaticProps = serverQuery(GQL_SEARCH_STATIC_PROPS, (data) => {
  const total_item_count = data.total_items.aggregate.count;
  const version_list = data.seed_version.nodes.map((node) => node.version);

  // last updated seed version
  const [{ timestamp, seed, version, player, seedVersion }] = data.recent_run_list;
  const item_count = seedVersion.items_aggregate.aggregate.count;
  const recent_run = {
    seed,
    version,
    timestamp,
    player,
    item_count,
  };

  // unroll top level artifact search into array of results
  const artifact_list = [];

  for (const cache_entry of data.unrand_cache) {
    const unrand = Unrands.ById[cache_entry.unrand_key];

    if (!unrand) {
      console.error('Cached unrand missing from local Unrands list', { cache_entry });
      continue;
    }

    artifact_list[unrand.i] = cache_entry.result_list;
  }

  return {
    total_item_count,
    version_list,
    recent_run,
    artifact_list,
  };
});

// // debug query easily by writing it to disk
// function debug_gql(gql_query) {
//   require('fs').writeFileSync('query.graphql', gql_query.loc.source.body);
// }
