import { gql } from '@apollo/client';

import fetch from 'src/utils/fetch';
import { serverQuery } from 'src/graphql/serverQuery';
import { UNRANDS } from 'src/utils/Unrands';

export async function getStaticProps(context) {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const [totalItemCount, query_artifact] = await Promise.all([GQL_TOTAL_ITEMS.run(), GQL_TOP_LEVEL.run()]);

  // unroll top level artifact search into array of results
  const artifact_list = [];

  for (let i = 0; i < UNRANDS.length; i++) {
    const result = query_artifact[result_key(i)];
    artifact_list.push(result);
  }

  const props = { totalItemCount, artifact_list };

  return {
    props,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
    revalidate: 300,
  };
}

const GQL_TOTAL_ITEMS = serverQuery(
  gql`
    query TotalItems {
      items: dcsseeds_scrapePlayers_item_aggregate {
        aggregate {
          count(columns: id)
        }
      }
    }
  `,
  (data) => data.items.aggregate.count,
);

const safe_name = (value) => value.replace(/"/g, '\\"');
const result_key = (i) => `result_${i}`;

const GQL_TOP_LEVEL = serverQuery(
  gql`
    query TopLevelArtifacts {
      ${UNRANDS.map(SeedVersionFilter)}
    }
  `,
  (data) => data,
);

function SeedVersionFilter(name, i) {
  const name_ilike = `%${safe_name(name)}%`;
  const key = result_key(i);

  return `
    ${key}: dcsseeds_scrapePlayers_seedVersion(
      where: { items: { name: { _ilike: "${name_ilike}" } } }
      order_by: { items_aggregate: { count: desc } }
    ) {
      seed
      version
    }`;
}
