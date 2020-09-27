const { query } = require('graphqurl');
const parseMorgue = require('src/utils/parseMorgue');
const updateSeedNotes = require('src/utils/updateSeedNotes');
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

    const {
      name,
      score,
      version,
      value,
      species,
      fullVersion,
      background,
      turns,
      timeSeconds,
      runes,
      runeCount,

      items,
    } = await parseMorgue(morgue);

    const variables = {
      morgue,
      name,
      score,
      version,
      value,
      species,
      fullVersion,
      background,
      turns,
      timeSeconds,
      runes,
      runeCount,
    };

    // console.log({ variables });

    // mutate to create seed player
    const createSeedPlayerResult = await query({
      query: CREATE_SEED_PLAYER,
      endpoint: GRAPHQL_ENDPOINT,
      variables,
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    // mutate to create seed notes
    const updateSeedNotesResults = await updateSeedNotes({ seed: value, version, items });

    const [resultSeedPlayer] = createSeedPlayerResult.data.insert_seed_player.returning;
    const [resultSeedNote] = updateSeedNotesResults.data.insert_seed_note.returning;

    if (resultSeedPlayer && resultSeedNote) {
      return send(res, 200, { resultSeedPlayer, resultSeedNote });
    }

    return send(res, 500, {
      message: 'Unable to submit morgue',
      createSeedPlayerResult,
      updateSeedNotesResults,
    });
  } catch (err) {
    return send(res, 500, err);
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const CREATE_SEED_PLAYER = `
  mutation InsertSeedPlayer(
    $morgue: String!
    $name: String!
    $score: Int!
    $version: String!
    $value: String!
    $species: String!
    $fullVersion: String!
    $background: String!
    $turns: Int!
    $timeSeconds: Int!
    $runes: json!
    $runeCount: Int!
  ) {
    insert_seed_player(
      objects: {
        morgue: $morgue
        name: $name
        score: $score
        turns: $turns
        timeSeconds: $timeSeconds
        runes: $runes
        runeCount: $runeCount
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
      on_conflict: { constraint: seed_player_pkey, update_columns: [runes, runeCount, updated] }
    ) {
      returning {
        id
      }
    }
  }
`;
