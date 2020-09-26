const { query } = require('graphqurl');
const parseMorgue = require('src/utils/parseMorgue');
const send = require('src/server/utils/zeitSend');
const { parse } = require('graphql');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// get all morgues and reparse them
// this should update existing morgues with the new fields from parseMorgue
// Example API Request
// http://localhost:3000/api/reparseMorgues

module.exports = async (req, res) => {
  try {
    if (!__DEV__) {
      return send(res, 500, new Error('reparseMorgues not available outside local dev!'));
    }

    // get all morgues
    const result = await query({
      query: QUERY_ALL_MORGUES,
      endpoint: GRAPHQL_ENDPOINT,
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const { allMorgues } = result.data;

    const updateAllMorgues = allMorgues.map(async (seedPlayer) => {
      const parsedMorgue = await parseMorgue(seedPlayer.morgue);
      const updatedMorgueResult = await query({
        query: gqlUpdateSeedPlayer(seedPlayer.id, parsedMorgue),
        endpoint: GRAPHQL_ENDPOINT,
        headers: {
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
      });
    });

    // wait for all updates to complete
    await Promise.all(updateAllMorgues);

    return send(res, 200);
  } catch (err) {
    return send(res, 500, err);
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const QUERY_ALL_MORGUES = `
  query AllMorgues {
    allMorgues: seed_player(order_by: {created: desc}) {
      morgue
      id
    }
  }
`;

const gqlUpdateSeedPlayer = (id, parsedMorgue) => {
  // pull out just the seed player fields (omit seed fields)
  // i.e. value, species, background, etc. will be excluded
  // parsedFieldsToUpdate will be the fields left to update
  const { value, fullVersion, version, seed, morgue, species, background, ...parsedFieldsToUpdate } = parsedMorgue;

  // build update fields, similar to json but no quotes around field names
  const allFieldValues = Object.keys(parsedFieldsToUpdate).map((field) => {
    let fieldValue = parsedFieldsToUpdate[field];

    const typeofField = typeof fieldValue;
    switch (typeofField) {
      case 'string':
        fieldValue = `"${fieldValue}"`;
        break;
      case 'object':
        fieldValue = `"${JSON.stringify(fieldValue).replace(/"/g, '\\"')}"`;
      case 'number':
      default:
        break;
    }

    return `${field}: ${fieldValue}`;
  });

  const updateFields = allFieldValues.join(', ');

  console.warn({ updateFields });

  return `
    mutation UpdateSeedPlayerParsedMorgue {
      update_seed_player(where: {id: {_eq: ${id}}}, _set: { ${updateFields} }) {
        returning {
          id
        }
      }
    }
  `;
};
