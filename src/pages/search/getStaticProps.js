import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';

export async function getStaticProps() {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const props = await GQL_SearchStaticProps.run();

  // console.debug({ props });

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

    branch_level_order: dcsseeds_scrapePlayers_branch_level(order_by: [{ order: asc }, { level: asc }]) {
      branch: name
      level
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
  }
`;

// debug_gql(GQL_SEARCH_STATIC_PROPS);

const GQL_SearchStaticProps = serverQuery(GQL_SEARCH_STATIC_PROPS, (data) => {
  const total_item_count = data.total_items.aggregate.count;
  const version_list = data.seed_version.nodes.map((node) => node.version);
  const branch_level_order = data.branch_level_order;

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

  return {
    total_item_count,
    version_list,
    branch_level_order,
    recent_run,
  };
});

// // debug query easily by writing it to disk
// function debug_gql(gql_query) {
//   require('fs').writeFileSync('query.graphql', gql_query.loc.source.body);
// }
