import { gql } from '@apollo/client';

import { serverQuery } from 'src/graphql/serverQuery';
import * as Unrands from 'src/utils/Unrands';

export async function get_artifact_list() {
  return artifact_list_query.run();
}

const artifact_list_document = gql`
  query ArtifactList {
    unrand_cache: dcsseeds_scrapePlayers_unrand_cache {
      result_list
      unrand_key
    }
  }
`;

// debug_gql(artifact_list_document);

const artifact_list_query = serverQuery(artifact_list_document, (data) => {
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
