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
    const seedNote = await getSeedNote({ seed: value, version, items });
    const createSeedNoteResult = await query({
      query: CREATE_SEED_NOTES,
      endpoint: GRAPHQL_ENDPOINT,
      variables: { seed: value, version, value: seedNote },
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const [resultSeedPlayer] = createSeedPlayerResult.data.insert_seed_player.returning;
    const [resultSeedNote] = createSeedNoteResult.data.insert_seed_note.returning;

    if (resultSeedPlayer && resultSeedNote) {
      return send(res, 200, { resultSeedPlayer, resultSeedNote });
    }

    return send(res, 500, {
      message: 'Unable to submit morgue',
      createSeedPlayerResult,
      createSeedNoteResult,
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
    $runes: jsonb!
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
      on_conflict: { constraint: seed_player_pkey, update_columns: updated }
    ) {
      returning {
        id
      }
    }
  }
`;

// {
//   "seed": "12134159514649495260",
//   "version": "0.25",
//   "value": "D8 Maggie: Wyrmbane\nD11 store: +10 Black Knight's horse barding {ponderous, rPois rN+}\nO2 store: +2 hat of the Bear Spirit {Spirit, +Rage rN+ MR++}\nO2 store: +1 kite shield \"Niugexis\" {rElec Dex+4}\nL6: +10 rapier of Invincibility (weapon) {holy, MP+9 Int+3 Stlth+, short}"
// }
const CREATE_SEED_NOTES = `
  mutation InsertSeedNotes($seed: String!, $version: String!, $value: String!) {
    insert_seed_note(
      objects: { seed: $seed, version: $version, value: $value }
      on_conflict: { constraint: seed_note_pkey, update_columns: [updated, value] }
    ) {
      returning {
        id
      }
    }
  }
`;

async function getSeedNote({ seed, version, items }) {
  // get seed notes, create + update if necessary
  const autoSeedNotes = items.map((_) => `[${_.location}] ${_.name}`);
  const existingSeedNotesQuery = await query({
    query: GET_SEED_NOTES,
    endpoint: GRAPHQL_ENDPOINT,
    variables: { seed, version },
    headers: {
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
  });
  // break apart by new lines
  const [existingSeedNote] = existingSeedNotesQuery.data.seed_note;
  const existingSeedNoteLines = existingSeedNote.value.split('\n');

  // combine by looking at each row in both notes
  // keep unique entries to ensure no overwriting
  const combinedNotes = [];
  const combinedNoteLookup = {};
  function parseNoteLine(line) {
    if (!combinedNoteLookup[line]) {
      combinedNoteLookup[line] = true;
      combinedNotes.push(line);
    }
  }
  // parse lines of both existing seed notes and autoSeedNotes
  existingSeedNoteLines.forEach(parseNoteLine);
  autoSeedNotes.forEach(parseNoteLine);

  return combinedNotes.join('\n');
}

// {
//   "seed": "12134159514649495260",
//   "version": "0.25"
// }
const GET_SEED_NOTES = `
  query GetSeedNotes($seed: String!, $version: String!) {
    seed_note(where: {version: {_eq: $version}, seed: {_eq: $seed}}) {
      id
      value
    }
  }
`;
