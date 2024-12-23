import bz2 from 'unbzip2-stream';
import stream from 'stream';

import { Stopwatch } from 'src/server/Stopwatch';

export async function fetch_stash_text({ morgue }) {
  const stash_url = new URL(`${morgue.basename}.lst`, morgue.url).href;

  const stash_resp = await fetch(stash_url);

  if (stash_resp.status === 404) {
    console.error(`stash status code [${stash_resp.status}] for [${stash_url}]`);
    return '';
  }

  if (!stash_resp.ok) {
    throw new Error(`stash status code [${stash_resp.status}] for [${stash_url}]`);
  }

  // convert ArrayBuffer into Buffer
  const uint_array = new Uint8Array(await stash_resp.arrayBuffer());
  const buffer = Buffer.from(uint_array);

  try {
    // convert Buffer into ReadStream
    const stash_stream = stream.Readable.from(buffer);

    // attempt to decompress stream as .bz2
    const decompressed_bz2 = stash_stream.pipe(bz2());

    // convert stream into string
    const result = await new Stopwatch()
      .time(promise_stream_string(decompressed_bz2))
      .timeout(500)
      .record('promise_stream_string');

    return result;
  } catch (error) {
    switch (true) {
      case error instanceof Stopwatch.Error:
      case error.message === 'No magic number found': {
        // if the above attempt to decompress failed then the stash was raw string
        // we can convert the buffer from fetch into a string
        return String(buffer);
      }
      // if error not handled above, rethrow
      default:
        throw error;
    }
  }
}

async function promise_stream_string(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    stream.on('error', (err) => {
      reject(err);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });
}
