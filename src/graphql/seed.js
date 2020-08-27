import { gql } from '@apollo/client';

function safeParser(parser) {
  return (query) => {
    if (!query) return query;

    if (typeof parser === 'function') {
      return parser(query);
    }

    return query;
  };
}

export const SEED_FRAGMENT = gql`
  fragment SeedFragment on seed {
    id
    hidden
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

const ACTIVE_SEEDS = {
  query: gql`
    query ActiveSeeds {
      activeSeeds: seed_aggregate(where: { hidden: { _eq: false } }) {
        aggregate {
          count(distinct: true)
        }
      }
      appConfig: config(where: { type: { _eq: "app" } }) {
        maxActiveSeeds: config(path: "MAX_ACTIVE_SEEDS")
      }
    }
  `,
  parse: safeParser((query) => {
    if (!query.data) return true;

    const {
      data: {
        activeSeeds: {
          aggregate: { count: activeSeedsCount },
        },
        appConfig: [{ maxActiveSeeds }],
      },
    } = query;

    return activeSeedsCount >= maxActiveSeeds;
  }),
};

const RECENT_SEEDS_GQL = gql`
  ${SEED_FRAGMENT}

  query RecentSeeds {
    recentSeeds: seed(limit: 5, where: { hidden: { _eq: false } }, order_by: { created: desc }) {
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
  ACTIVE_SEEDS,
  COMPARE_PLAYERS,
};
