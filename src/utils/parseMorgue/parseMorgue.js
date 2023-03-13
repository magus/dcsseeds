import { Morgue } from 'src/utils/Morgue';

import { parse_morgue_text } from './parse_morgue_text';
import { fetch_lst } from './fetch_lst';

async function fetch_morgue_text(url) {
  const response = await fetch(url);
  return await response.text();
}

export async function parseMorgue(url) {
  const morgue = new Morgue(url);

  const [lst, morgue_text] = await Promise.all([
    // parallel fetch lst and morgue file
    fetch_lst({ morgue }),
    fetch_morgue_text(morgue.url),
  ]);

  const parsed = await parse_morgue_text({ morgue, morgue_text, lst });

  return {
    morgue,
    ...parsed,
    lst,
  };
}
