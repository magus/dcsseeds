const { query } = require('graphqurl');
const parseMorgue = require('src/utils/parseMorgue');
const send = require('src/server/utils/zeitSend');
const { parse } = require('graphql');

const { HASURA_ADMIN_SECRET } = process.env;

if (!HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// parse a morgue file
// Example API Request
// http://localhost:3000/api/parseMorgue?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt

module.exports = async (req, res) => {
  try {
    const { morgue } = req.query;

    if (!morgue) {
      return send(res, 500, new Error('Must provide [morgue]'));
    }

    const morgueParsed = await parseMorgue(morgue);

    console.log(morgueParsed.items.map((_) => `[${_.location}] ${_.name}`).join('\n'));

    const data = { morgueParsed };
    console.debug({ morgueParsed });

    return send(res, 200, data);
  } catch (err) {
    return send(res, 500, err);
  }
};
