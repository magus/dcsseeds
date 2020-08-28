import { gql } from '@apollo/client';

function safeParser(parser) {
  return (query) => {
    if (!query) return query;

    if (typeof parser === 'function') {
      // safely return immediately if data is unavailable
      if (!query.data) return query.data;
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
  }
`;

export const ACTIVE_SEEDS = {
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

export const HIDE_SEED = {
  query: gql`
    mutation HideSeed($id: Int!) {
      update_seed(where: { id: { _eq: $id } }, _set: { hidden: true }) {
        returning {
          id
          hidden
        }
      }
    }
  `,
};

export const RECENT_SEEDS = {
  query: gql`
    ${SEED_FRAGMENT}

    query RecentSeeds {
      recentSeeds: seed(limit: 5, where: { hidden: { _eq: false } }, order_by: { created: desc }) {
        ...SeedFragment
        players(order_by: { name: asc, score: desc }, distinct_on: name) {
          name
        }
      }
    }
  `,
  parse: safeParser((query) => query.data.recentSeeds),
};

export const HISTORY_SEEDS = {
  query: gql`
    ${SEED_FRAGMENT}

    query HistorySeeds {
      historySeeds: seed(where: { hidden: { _eq: true } }, order_by: { created: desc }) {
        ...SeedFragment
        players(limit: 10, order_by: { score: desc, name: asc }) {
          name
          score
          morgue
        }
      }
    }
  `,
  parse: safeParser((query) => query.data.historySeeds),
};

export const COMPARE_PLAYERS = gql`
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
