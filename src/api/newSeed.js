const { query } = require('graphqurl');
const fetch = require('src/server/utils/fetch');
const send = require('src/server/utils/zeitSend');
const Species = require('src/utils/Species');
const { reject, first } = require('lodash');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

async function regexAsync(id, content, regex) {
  return new Promise((resolve, _reject) => {
    const reject = (field) => {
      const message = ['regexAsync', id, field].join(' ');
      // _reject(message);
      throw new Error(message);
    };

    const match = content.match(regex);
    if (!match) {
      return reject('match');
    }

    const [, firstGroup] = match;
    if (!firstGroup) {
      return reject('group');
    }

    return resolve(match);
  });
}

// submit a new seed
// e.g.
// Example API Request
// http://localhost:3000/api/newSeed?background=Ice%20Elementalist&species=Ogre&version=0.25&value=06394256146285325279

module.exports = async (req, res) => {
  try {
    const { background, species, version, value } = req.query;

    if (!(background && species && version && value)) {
      return send(res, 500, {
        error: true,
        data: {
          message: 'Must provide [background], [species], [version] and [value]',
        },
      });
    }

    // mutate to create seed player
    const result = await query({
      query: CREATE_SEED,
      endpoint: GRAPHQL_ENDPOINT,
      variables: {
        background,
        species,
        version,
        value,
      },
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const [newSeed] = result.data.insert_seed.returning;

    if (newSeed) {
      return send(res, 200, {
        error: false,
        data: newSeed,
      });
    }

    return send(res, 500, {
      error: true,
      data: {
        message: 'Unable to create seed',
        result,
      },
    });
  } catch (err) {
    const data = {
      error: true,
    };

    if (err && err.stack) {
      data.stack = err.stack.split('\n');
    } else if (err) {
      data.rawError = err;
    }

    return send(res, 500, data);
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const CREATE_SEED = `
  mutation($background: String!, $species: String!, $version: String!, $value: String!) {
    insert_seed(
      objects: { background: $background, species: $species, version: $version, value: $value }
      on_conflict: { constraint: seed_pkey1, update_columns: value }
    ) {
      returning {
        id
      }
    }
  }
`;
