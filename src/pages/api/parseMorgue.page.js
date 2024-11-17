import { parseMorgue } from 'src/utils/parseMorgue';
import send from 'src/server/zeitSend';

// parse a morgue file
// Example API Request
// http://localhost:3000/api/parseMorgue?morgue=http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20200825-111643.txt

export default async function handler(req, res) {
  try {
    const { morgue } = req.query;

    if (!morgue) {
      return await send(res, 500, new Error('Must provide [morgue]'));
    }

    const hrStartTime = process.hrtime();
    const morgueParsed = await parseMorgue(morgue);
    const timeMs = hrTimeUnit(process.hrtime(hrStartTime), 'ms');

    const data = { timeMs, morgueParsed };
    // console.debug({ morgueParsed });
    return await send(res, 200, data, { prettyPrint: true });
  } catch (err) {
    return await send(res, 500, err, { prettyPrint: true });
  }
}

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
