const { query } = require('graphqurl');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

module.exports = async function updateSeedNotes({ seed, version, items }) {
  // mutate to create seed notes
  const seedNote = await getSeedNote({ seed, version, items });

  // console.log('updateSeedNotes', { seed, seedNote });

  const createSeedNoteResult = await query({
    query: CREATE_SEED_NOTES,
    endpoint: GRAPHQL_ENDPOINT,
    variables: { seed, version, value: seedNote },
    headers: {
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    },
  });

  return createSeedNoteResult;
};

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
  const hasExistingNotes = existingSeedNote && existingSeedNote.value.trim();
  const existingSeedNoteLines = hasExistingNotes ? hasExistingNotes.split('\n') : [];

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

  // console.log({ combinedNotes, autoSeedNotes, existingSeedNoteLines });

  return combinedNotes.join('\n');
}

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

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
