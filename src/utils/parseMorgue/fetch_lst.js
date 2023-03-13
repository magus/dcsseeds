import bz2 from 'unbzip2-stream';
import stream from 'stream';

export async function fetch_lst({ morgue }) {
  const lst_url = new URL(`${morgue.basename}.lst`, morgue.url).href;

  const lst_response = await fetch(lst_url);

  if (!lst_response.ok) {
    throw new Error(`lst status code [${lst_response.status}]`);
  }

  // convert ArrayBuffer into Buffer
  const uint_array = new Uint8Array(await lst_response.arrayBuffer());
  const buffer = new Buffer(uint_array);

  try {
    // convert Buffer into ReadStream
    const lst_stream = stream.Readable.from(buffer);
    // attempt to decompress stream as .bz2
    const decompressed_bz2 = lst_stream.pipe(bz2());
    // convert stream into string
    return await promise_stream_string(decompressed_bz2);
  } catch (error) {
    switch (error.message) {
      case 'No magic number found': {
        // if the above attempt to decompress failed then the lst was raw string
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
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}
