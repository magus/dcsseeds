import { gql } from '@apollo/client';

import fetch from 'src/utils/fetch';
import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export async function getStaticProps(context) {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const props = await GQL_SearchStaticProps.run();

  return {
    props,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
    revalidate: 60,
  };
}

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

const GQL_SearchStaticProps = serverQuery(
  gql`
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

      ${Unrands.List.map(SeedVersionFilter)}
    }

    ${ResultFragment}
  `,
  (data) => {
    const total_item_count = data.total_items.aggregate.count;
    const version_list = data.seed_version.nodes.map((node) => node.version);

    // unroll top level artifact search into array of results
    const artifact_list = [];

    for (let i = 0; i < Unrands.List.length; i++) {
      const result = data[result_key(i)];
      artifact_list.push(result);
    }

    return {
      total_item_count,
      version_list,
      artifact_list,
    };
  },
);
