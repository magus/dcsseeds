import { gql } from '@apollo/client';

export const SEED_FRAGMENT = gql`
  fragment SeedFragment on seed {
    id
    value
    created
    version
    species
    background
    players(limit: 5, order_by: { score: desc }) {
      name
      score
      morgue
    }
  }
`;

const RECENT_SEEDS_GQL = gql`
  ${SEED_FRAGMENT}

  {
    recentSeeds: seed(limit: 5, order_by: { created: desc }) {
      ...SeedFragment
    }
  }
`;

const COMPARE_PLAYERS = gql`
  ${SEED_FRAGMENT}

  query CompareSeeds($playerA: String = "", $playerB: String = "") {
    compareSeeds: seed(
      order_by: { created: desc }
      where: { _and: [{ players: { name: { _eq: $playerA } } }, { players: { name: { _eq: $playerB } } }] }
    ) {
      ...SeedFragment
    }
  }
`;

export default {
  RECENT_SEEDS_GQL,
};
