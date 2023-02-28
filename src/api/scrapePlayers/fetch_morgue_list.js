import { Morgue } from 'src/server/Morgue';
import { SERVER_CONFIG } from './ServerConfig';

import { VERSION_LIST, MINIMUM_ALLOWED_DATE } from './constants';

export async function fetch_morgue_list(player) {
  const morgue_list = [];
  const skip_morgue_set = new Set();

  const server_config = SERVER_CONFIG[player.server];

  if (!server_config) {
    // throw new Error(`unrecognized server [${player.server}]`);
    console.error('fetch_morgue_list', 'unrecognized server', player.name, player.server);
    return { morgue_list, skip_morgue_set };
  }

  const regex = server_config.morgueRegex(player.name);
  const morgue_list_url_list = server_config.morgue_list_url_list(player.name, VERSION_LIST);

  for (const morgue_list_url of morgue_list_url_list) {
    let html;

    try {
      const resp = await fetch(morgue_list_url);

      if (resp.status === 404) {
        continue;
      }

      html = await resp.text();
    } catch (error) {
      continue;
    }

    let match;

    function next_match() {
      // move to next match
      match = regex.exec(html);
      return match;
    }

    // keep moving forward until we run out of matches
    // this will return null when we cycle at end of matches
    while (next_match()) {
      const [, filename, timeString] = match;
      const url = `${morgue_list_url}/${filename}`;

      const morgue = new Morgue(url);

      // filter morgue before minimum allowed date
      if (morgue.date < MINIMUM_ALLOWED_DATE) {
        // if not already marked, add to skip morgue list
        if (!player.morgues[morgue.timestamp]) {
          skip_morgue_set.add(morgue.timestamp);
        }

        continue;
      }

      // if we got to this point, add this morgue to list
      morgue_list.push(morgue);
    }
  }

  // reverse the list so that most recent (bottom) is first
  morgue_list.reverse();

  return { morgue_list, skip_morgue_set };
}
