import { Morgue } from './Morgue';
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

  const morgue_regex = server_config.player_morgue_regex(player.name);
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
      match = morgue_regex.exec(html);
      return match;
    }

    // keep moving forward until we run out of matches
    // this will return null when we cycle at end of matches
    while (next_match()) {
      const { filename } = match.groups;

      // safely join two urls regardless of traliing `/` characters
      // previously this was line was
      //     const url = `${morgue_list_url}/${filename}`;
      // but this incorrectly generated `.../magusnn//morgue-magusnn-20230...`
      // note the double `//` which is because we include trailing slash on morgue list url
      // this is intentionally including the trailing slash because it's required for berato
      // https://github.com/magus/dcsseeds/commit/4226d30bc116ac4675faec9cfa376134d747e3c6
      const url = new URL(filename, morgue_list_url).href;

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

  if (morgue_list.length === 0) {
    return { morgue_list, skip_morgue_set };
  }

  // sort list so that most recent is first
  morgue_list.sort((a, b) => b.timestamp - a.timestamp);

  return { morgue_list, skip_morgue_set };
}
