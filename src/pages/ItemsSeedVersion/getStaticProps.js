import { gql } from '@apollo/client';

import fetch from 'src/utils/fetch';
import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export async function getStaticProps(context) {
  // context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=1800');

  const { seed, version } = context.params;

  const [item_list] = await Promise.all([GQL_ItemsSeedVersion.run({ seed, version })]);

  const props = { seed, version, item_list };

  return {
    props,
    // https://nextjs.org/docs/api-reference/data-fetching/get-static-props#revalidate
    revalidate: 60,
  };
}

const Result = gql`
  fragment Result on dcsseeds_scrapePlayers_item {
    name
    branchName
    level
    morgue
  }
`;

const GQL_ItemsSeedVersion = serverQuery(
  gql`
    query ItemsSeedVersion($seed: String!, $version: String!) {
      item_list: dcsseeds_scrapePlayers_items_version_seed(args: { input_seed: $seed, input_version: $version }) {
        ...Result
      }
    }

    ${Result}
  `,
  (data) => data.item_list,
);
