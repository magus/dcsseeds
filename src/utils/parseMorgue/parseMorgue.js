import { Morgue } from 'src/utils/Morgue';

import { parse_stash_text } from './parse_stash_text';
import { parse_morgue_text } from './parse_morgue_text';
import { fetch_stash_text } from './fetch_stash_text';

async function fetch_morgue_text(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`failed to fetch morgue [${response.status}]`);
  }

  return await response.text();
}

export async function parseMorgue(url) {
  const morgue = new Morgue(url);

  const [stash_text, morgue_text] = await Promise.all([
    // parallel fetch lst and morgue file
    fetch_stash_text({ morgue }),
    fetch_morgue_text(morgue.url),
  ]);

  const stash = await parse_stash_text(stash_text);
  const parsed_morgue = await parse_morgue_text({ morgue, morgue_text, stash });

  return {
    morgue,
    ...parsed_morgue,
    stash,
  };
}
