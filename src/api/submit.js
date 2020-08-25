const { query } = require('graphqurl');
const fetch = require('src/server/utils/fetch');
const send = require('src/server/utils/zeitSend');
const Species = require('src/utils/Species');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// submit a morgue with a seed
// e.g.
// http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt
// Example API Request
// http://localhost:3000/api/submit?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt

module.exports = async (req, res) => {
  try {
    const { morgue } = req.query;

    if (!morgue) {
      return send(res, 500, {
        error: true,
        data: {
          message: 'Must provide [morgue]',
        },
      });
    }

    const morgueResponse = await fetch(morgue);
    const morgueText = await morgueResponse.text();

    const [, name] = morgue.match(/rawdata\/(.*?)\//);
    const [, fullVersion, version] = morgueText.match(/version ((\d+\.\d+)\..*?)\s.*?character file./);
    const [, seed] = morgueText.match(/Game seed: (\d+)/);
    const [, score] = morgueText.match(new RegExp(`Game seed: \\d+[^\\d]*?(\\d+) ${name}`));
    const [, speciesBackground] = morgueText.match(new RegExp(`${name}.*?\\((.*?)\\)\\s+Turns:`));
    const [, species] = speciesBackground.match(Species.Regex);
    const background = speciesBackground.replace(species, '').trim();

    // mutate to create seed player
    const result = await query({
      query: CREATE_SEED_PLAYER,
      endpoint: GRAPHQL_ENDPOINT,
      variables: {
        name,
        score,
        morgue,
        background,
        species,
        version,
        value: seed,
        fullVersion,
      },
      headers: {
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
    });

    const [newSeedPlayer] = result.data.insert_seed_player.returning;

    if (newSeedPlayer) {
      return send(res, 200, {
        error: false,
        data: newSeedPlayer,
      });
    }

    return send(res, 500, {
      error: true,
      data: {
        message: 'Unable to create seed player',
        result,
      },
    });
  } catch (err) {
    return send(res, 500, {
      error: true,
      message: err.stack,
    });
  }
};

const GRAPHQL_ENDPOINT = 'https://dcsseeds.herokuapp.com/v1/graphql';

const CREATE_SEED_PLAYER = `
mutation MyMutation($morgue: String = "", $name: String = "", $score: Int = 10, $version: String = "", $value: String = "", $species: String = "", $fullVersion: String = "", $background: String = "") {
  insert_seed_player(objects: {morgue: $morgue, name: $name, score: $score, seed: {data: {background: $background, fullVersion: $fullVersion, species: $species, value: $value, version: $version}, on_conflict: {constraint: seed_pkey1, update_columns: value}}}) {
    returning {
      id
    }
  }
}
`;
