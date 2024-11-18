import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';

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

const GQL_ItemsSeedVersion = serverQuery(
  gql`
    query ItemsSeedVersion($seed: String!, $version: String!) {
      item_list: dcsseeds_scrapePlayers_items_version_seed(args: { input_seed: $seed, input_version: $version }) {
        ...SeedVersionItem
      }
    }

    fragment SeedVersionItem on dcsseeds_scrapePlayers_item {
      name
      branchName
      level
      morgue
      gold
    }
  `,
  (data) => data.item_list,
);
