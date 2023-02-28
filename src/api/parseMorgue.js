const { parseMorgue } = require('src/utils/parseMorgue');
const send = require('src/server/zeitSend');

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

    const hrStartTime = process.hrtime();
    const morgueParsed = await parseMorgue(morgue);
    const timeMs = hrTimeUnit(process.hrtime(hrStartTime), 'ms');

    const data = { timeMs, morgueParsed };
    // console.debug({ morgueParsed });
    return send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return send(res, 500, err, { prettyPrint: true });
  }
};

function hrTimeUnit(hrTime, unit) {
  switch (unit) {
    case 'ms':
      return hrTime[0] * 1e3 + hrTime[1] / 1e6;
    case 'micro':
      return hrTime[0] * 1e6 + hrTime[1] / 1e3;
    case 'nano':
    default:
      return hrTime[0] * 1e9 + hrTime[1];
  }
}
