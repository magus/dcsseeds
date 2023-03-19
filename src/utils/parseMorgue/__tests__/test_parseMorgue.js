/* global jest */
import fs from 'fs';
import path from 'path';

import { Morgue } from 'src/utils/Morgue';

import { parseMorgue } from '../parseMorgue';

export async function test_parseMorgue(morgue_url) {
  const tester = setup_test_parseMorgue(morgue_url);
  return await tester.run();
}

export function setup_test_parseMorgue(morgue_url) {
  const morgue = new Morgue(morgue_url);

  const lst_filename = `${morgue.basename}.lst`;

  const mocks = {};

  mocks.fetch = {};

  mocks.fetch.morgue = {
    ok: true,
    status: 200,
    text: async function text() {
      const morgue_filepath = path.join(__dirname, morgue.basename, morgue.filename);
      const morgue_buffer = fs.readFileSync(morgue_filepath);
      const morgue_content = String(morgue_buffer);

      return morgue_content;
    },
  };

  mocks.fetch.lst = {
    ok: true,
    status: 200,
    arrayBuffer: async function arrayBuffer() {
      const lst_filepath = path.join(__dirname, morgue.basename, lst_filename);
      const lst_buffer = fs.readFileSync(lst_filepath);
      const lst_arraybuffer = lst_buffer.buffer.slice(
        lst_buffer.byteOffset,
        lst_buffer.byteOffset + lst_buffer.byteLength,
      );

      return lst_arraybuffer;
    },
  };

  jest.spyOn(global, 'fetch').mockImplementation(async (url) => {
    if (url.includes(morgue.filename)) {
      return mocks.fetch.morgue;
    } else if (url.includes(lst_filename)) {
      return mocks.fetch.lst;
    }

    throw new Error(`fetch spy did not handle [${url}]`);
  });

  async function run() {
    const result = await parseMorgue(morgue_url);

    if (result.eventErrors.length) {
      console.error(result.eventErrors);
      throw new Error(`[${result.eventErrors.length}] event errors`);
    }

    return result;
  }

  return { mocks, morgue, run };
}
