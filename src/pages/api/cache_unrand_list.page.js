import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export default async function cahce_unrand_list(req, res) {
  // https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#recommended-cache-control
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=900, stale-while-revalidate=5400');

  const result = await GQL_SearchStaticProps.run();

  // console.debug({ props });

  return res.status(200).json(result);

  // next 13+ edge runtime?

  // return new Response(JSON.stringify(result), {
  //   status: 200,
  //   headers: {
  //     'content-type': 'application/json',
  //     'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
  //   },
  // });
}

const GQL_SEARCH_STATIC_PROPS = gql`
  query SearchStaticProps {
    unrand_cache: dcsseeds_scrapePlayers_unrand_cache {
      result_list
      unrand_key
    }
  }
`;

// debug_gql(GQL_SEARCH_STATIC_PROPS);

const GQL_SearchStaticProps = serverQuery(GQL_SEARCH_STATIC_PROPS, (data) => {
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

  // ensure empty slots are filled with empty array
  // this happens when unrand_cache has no results for an item
  // common when updating versions, this was added during 0.30.0 update
  for (let i = 0; i < Unrands.List.length; i++) {
    const unrand = Unrands.Metadata[i];

    if (!artifact_list[i]) {
      console.error('Missing', { i, unrand });
      artifact_list[i] = [];
    }
  }

  return {
    artifact_list,
  };
});

// // debug query easily by writing it to disk
// function debug_gql(gql_query) {
//   require('fs').writeFileSync('query.graphql', gql_query.loc.source.body);
// }
