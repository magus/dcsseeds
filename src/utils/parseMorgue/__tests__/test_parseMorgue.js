/* global jest */
import fs from 'fs';
import path from 'path';

import { parseMorgue } from '../parseMorgue';

export async function test_parseMorgue(morgue_url) {
  const filename = path.basename(morgue_url);

  const filepath = path.join(__dirname, '..', '__fixtures__', filename);
  const buffer = fs.readFileSync(filepath);
  const content = String(buffer);

  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    async function text() {
      return content;
    }

    return { text };
  });

  const result = await parseMorgue(morgue_url);

  if (result.eventErrors.length) {
    console.error(result.eventErrors);
    throw new Error(`[${result.eventErrors.length}] event errors`);
  }

  return result;
}
