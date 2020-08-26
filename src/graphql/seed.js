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
  query CompareSeeds($playerA: String = "", $playerB: String = "") {
    playerA: seed_player_aggregate(
      where: {
        _and: [
          { seed: { _and: [{ players: { name: { _eq: $playerA } } }, { players: { name: { _eq: $playerB } } }] } }
          { name: { _eq: $playerA } }
        ]
      }
      order_by: { seed_id: desc, score: desc }
      distinct_on: seed_id
    ) {
      aggregate {
        count
        sum {
          score
        }
      }
    }
    playerB: seed_player_aggregate(
      where: {
        _and: [
          { seed: { _and: [{ players: { name: { _eq: $playerA } } }, { players: { name: { _eq: $playerB } } }] } }
          { name: { _eq: $playerB } }
        ]
      }
      order_by: { seed_id: desc, score: desc }
      distinct_on: seed_id
    ) {
      aggregate {
        count
        sum {
          score
        }
      }
    }
    compareSeeds: seed(
      order_by: { created: desc }
      where: { _and: [{ players: { name: { _eq: $playerA } } }, { players: { name: { _eq: $playerB } } }] }
    ) {
      id
      species
      background
      players(order_by: { name: desc, score: desc }, distinct_on: name) {
        name
        score
      }
    }
  }
`;

export default {
  RECENT_SEEDS_GQL,
  COMPARE_PLAYERS,
};
