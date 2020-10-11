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
  const existingSeedNoteTrimmed = !existingSeedNote ? '' : existingSeedNote.value.trim();
  const existingSeedNoteLines = existingSeedNoteTrimmed ? existingSeedNoteTrimmed.split('\n') : [];

  // key on `[location] name`
  const getItemNoteKey = (_) => `[${_.location}] ${_.name}`;

  // start with existing seed note lines
  // only add if item key (getItemNoteKey) not found
  const combinedNotes = [...existingSeedNoteLines];

  items.forEach((item) => {
    const key = getItemNoteKey(item);
    if (!!~existingSeedNoteTrimmed.indexOf(key)) {
      // skip, item already accounted for
      // this will preserve rows where we add extra information, e.g. shop price, monster, etc.
    } else {
      // add this item row
      combinedNotes.push(key);
    }
  });

  // console.log({ combinedNotes });

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