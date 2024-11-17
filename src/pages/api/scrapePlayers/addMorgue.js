import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import { parseMorgue } from 'src/utils/parseMorgue';
import { error_json } from 'src/utils/error_json';

import * as constants from './constants';

export async function addMorgue(args) {
  const { player, morgue } = args;

  const playerId = player.id;

  function response(status, extra) {
    // locally mark morgue as visited
    if (player.morgues) {
      player.morgues[morgue.timestamp] = true;
    }

    return { status, morgue: morgue.filename, extra };
  }

  async function skip(reason) {
    // used for errors and empty runs (no items)
    // create a morgue entry in scrapePlayers for this player morgue, so we do not search it again
    if (!args.dry) {
      await GQL_ADD_MORGUE.run({
        playerId,
        data: { [morgue.timestamp]: true },
        morgue_url: morgue.url,
      });
    }

    return response(`skip (${reason})`);
  }

  try {
    // parse morgue
    const data = await parseMorgue(morgue.url);
    // console.debug('addMorge', { data });

    const { version, fullVersion, value: seed } = data;

    // skip if bcrawl
    if (data.is_bcrawl) {
      return skip(`bcrawl runs not allowed`);
    }

    // skip if bloatcrawl
    if (data.isBloatcrawl) {
      return skip(`bloatcrawl runs not allowed`);
    }

    // skip if sprint
    if (data.isSprint) {
      return skip(`sprint runs not allowed`);
    }

    // skip if trunk
    if (data.isTrunk) {
      return skip(`trunk seeds not allowed [${fullVersion}]`);
    }

    // skip if below minimum allowed version
    if (constants.version_gate(version)) {
      return skip(`below minimum allowed version [${fullVersion}]`);
    }

    // log all errors into scrapePlayers_errors table
    if (Array.isArray(data.eventErrors) && data.eventErrors.length) {
      // collect valid scrape errors from data.eventErrors
      const errors = [];
      for (const eventError of data.eventErrors) {
        if (eventError.morgueNote) {
          const { morgue, turn, note, loc } = eventError.morgueNote;
          errors.push({ morgue, turn, loc, note, error: eventError.error });
        }
      }

      // write error into db
      if (!args.dry) {
        await GQL_ADD_PARSE_ERROR.run({ errors });
      }

      // exit this morgue marking it locally only
      return response('error', errors);
    }

    // collect items to send in a single mutation call
    const items = [];

    // { name, location, branch, level, gold }
    function create_insert_item(item) {
      // creates and associate branch if needed
      const branch = {
        data: { name: item.branch },
        on_conflict: { constraint: 'dcsseeds_scrapePlayers_branch_pkey', update_columns: 'name' },
      };

      const branch_level = {
        data: { name: item.branch },
        on_conflict: { constraint: 'dcsseeds_scrapePlayers_branch_level_pkey', update_columns: 'name' },
      };

      // optionally include level
      if (item.level) {
        branch_level.data.level = parseInt(item.level, 10);
      }

      // creates and associate seed+version if needed
      const seedVersion = {
        data: { seed, version },
        on_conflict: { constraint: 'dcsseeds_scrapePlayers_seedVersion_pkey', update_columns: 'seed' },
      };

      const insert_item = {
        name: item.name,
        branch,
        branch_level,
        location: item.location,
        morgue: morgue.url,
        playerId,
        timestamp: morgue.date,
        seedVersion,
        fullVersion,
      };

      if (item.gold) {
        insert_item.gold = parseInt(item.gold, 10);
      }

      return insert_item;
    }

    for (const event of data.events) {
      // only allow parseMorgue 'item' `type` (first string arg to createItem)
      if (event.type !== 'item') continue;

      // do not record seed items for areas with non-deterministic drops
      // e.g. Abyss, Pandemonium, Trove etc.
      if ({ Abyss: 1, Pandemonium: 1, Trove: 1 }[event.branch]) continue;

      items.push(
        create_insert_item({
          name: event.data.item,
          location: event.location,
          branch: event.branch,
          level: event.level,
          gold: event.data.gold,
        }),
      );
    }

    if (items.length) {
      if (!args.dry) {
        const result = await GQL_ADD_ITEM.run({
          items,
          playerId,
          // remote (server) mark morgue as visited
          data: { [morgue.timestamp]: true },
          morgue_url: morgue.url,
        });

        return response('done (items)', result);
      }

      return response('done (dry run skip items)', items);
    }

    return skip('empty');
  } catch (error) {
    // write error into db
    if (!args.dry) {
      const errors = [{ morgue: morgue.url, error: error.message }];
      GQL_ADD_PARSE_ERROR.run({ errors });
    }

    // bubble error
    return response('error', error_json(error));
  }
}

const GQL_ADD_ITEM = serverQuery(
  gql`
    mutation AddItem(
      $playerId: uuid!
      $data: jsonb!
      $items: [dcsseeds_scrapePlayers_item_insert_input!]!
      $morgue_url: String!
    ) {
      update_dcsseeds_scrapePlayers(
        _append: { morgues: $data }
        where: { id: { _eq: $playerId } }
        _set: { lastRun: "now()" }
      ) {
        affected_rows
      }

      delete_dcsseeds_scrapePlayers_errors(where: { morgue: { _eq: $morgue_url } }) {
        affected_rows
      }

      items: insert_dcsseeds_scrapePlayers_item(
        objects: $items
        on_conflict: {
          constraint: dcsseeds_scrapePlayers_item_name_branchName_level_seed_morgue_f
          update_columns: name
        }
      ) {
        returning {
          seed
          version
        }
      }
    }
  `,
  (data) => {
    const item_count = data.items.returning.length;
    const [first_item] = data.items.returning;
    const { seed, version } = first_item;
    return { item_count, seed, version };
  },
);

const GQL_ADD_MORGUE = serverQuery(
  gql`
    mutation AddMorgue($playerId: uuid!, $data: jsonb!, $morgue_url: String!) {
      update_dcsseeds_scrapePlayers(
        _append: { morgues: $data }
        where: { id: { _eq: $playerId } }
        _set: { lastRun: "now()" }
      ) {
        affected_rows
      }

      delete_dcsseeds_scrapePlayers_errors(where: { morgue: { _eq: $morgue_url } }) {
        affected_rows
      }
    }
  `,
);

const GQL_ADD_PARSE_ERROR = serverQuery(gql`
  mutation AddParseError($errors: [dcsseeds_scrapePlayers_errors_insert_input!]!) {
    insert_dcsseeds_scrapePlayers_errors(
      objects: $errors
      on_conflict: { constraint: dcsseeds_scrapePlayers_errors_error_morgue_turn_loc_note_key, update_columns: error }
    ) {
      affected_rows
    }
  }
`);

// Hasura: Clean up scheduled triggers data
// https://hasura.io/docs/latest/graphql/core/scheduled-triggers/clean-up.html
// Go to https://dcsseeds.herokuapp.com/console/data/sql
// -- delete all cron events older than 1 day
// DELETE FROM hdb_catalog.hdb_cron_events
// WHERE
//     status IN ('delivered', 'error', 'dead')
//     AND created_at < now() - interval '1 day';
