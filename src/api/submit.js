const { query } = require('graphqurl');
const parseMorgue = require('src/utils/parseMorgue');
const send = require('src/server/utils/zeitSend');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// submit a morgue with a seed
// Example API Request
// http://localhost:3000/api/submit?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt

module.exports = async (req, res) => {
  try {
    const { morgue } = req.query;

    if (!morgue) {
      return send(res, 500, new Error('Must provide [morgue]'));
    }

    const morgueParsed = await parseMorgue(morgue);

    // mutate to create seed player
    const result = await query({
      query: CREATE_SEED_PLAYER,
      endpoint: GRAPHQL_ENDPOINT,
      variables: {
        ...morgueParsed,
      },
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const [newSeedPlayer] = result.data.insert_seed_player.returning;

    if (newSeedPlayer) {
      return send(res, 200, newSeedPlayer);
    }

    return send(res, 500, {
      message: 'Unable to create seed player',
      result,
    });
  } catch (err) {
    return send(res, 500, err);
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const CREATE_SEED_PLAYER = `
  mutation MyMutation(
    $morgue: String = ""
    $name: String = ""
    $score: Int = 10
    $version: String = ""
    $value: String = ""
    $species: String = ""
    $fullVersion: String = ""
    $background: String = ""
  ) {
    insert_seed_player(
      objects: {
        morgue: $morgue
        name: $name
        score: $score
        seed: {
          data: {
            background: $background
            fullVersion: $fullVersion
            species: $species
            value: $value
            version: $version
          }
          on_conflict: { constraint: seed_pkey1, update_columns: fullVersion }
        }
      }
    ) {
      returning {
        id
      }
    }
  }
`;
