import { gql } from '@apollo/client';

import fetch from 'src/utils/fetch';
import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export async function getStaticProps(context) {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const [totalItemCount, query_artifact] = await Promise.all([GQL_TOTAL_ITEMS.run(), GQL_TOP_LEVEL.run()]);

  // unroll top level artifact search into array of results
  const artifact_list = [];

  for (let i = 0; i < Unrands.List.length; i++) {
    const result = query_artifact[result_key(i)];
    artifact_list.push(result);
  }

  const props = { totalItemCount, artifact_list };

  return {
    props,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
    revalidate: 60,
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

const ResultFragment = gql`
  fragment Result on dcsseeds_scrapePlayers_item {
    name
    branchName
    level
    morgue
  }
`;

const GQL_TOP_LEVEL = serverQuery(gql`
  query TopLevelArtifacts {
    ${Unrands.List.map(SeedVersionFilter)}
  }

  ${ResultFragment}
`);

// // debug query easily by writing it to disk
// require('fs').writeFileSync(
//   'query.graphql',
//   gql`
// query TopLevelArtifacts {
//   ${Unrands.List.map(SeedVersionFilter)}
// }

// ${ResultFragment}
// `.loc.source.body,
// );

function SeedVersionFilter(name, i) {
  const name_ilike = `%${safe_name(name)}%`;
  const key = result_key(i);

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
