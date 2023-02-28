import { gql } from '@apollo/client';
import { serverQuery } from 'src/graphql/serverQuery';
import { parseMorgue } from 'src/utils/parseMorgue';
import runRegex from 'src/utils/runRegex';
import { toNumber } from 'src/utils/toNumber';

export async function addMorgue(args) {
  const { player, morgue, MINIMUM_ALLOWED_VERSION } = args;

  const playerId = player.id;
  const { url, timestamp } = morgue;

  function response(status, extra) {
    // locally mark morgue as visited
    if (player.morgues) {
      player.morgues[morgue.timestamp] = true;
    }

    return { status, morgue: url, extra };
  }

  async function skip(reason) {
    // used for errors and empty runs (no items)
    // create a morgue entry in scrapePlayers for this player morgue, so we do not search it again
    await GQL_ADD_MORGUE.run({
      playerId,
      data: { [morgue.timestamp]: true },
    });

    return response(`skip (${reason})`);
  }

  try {
    // parse morgue
    const data = await parseMorgue(url);
    // console.debug('addMorge', { data });

    const { version, fullVersion, value: seed } = data;

    // skip if bcrawl
    if (data.is_bcrawl) {
      return skip(`bcrawl runs not allowed`);
    }

    // skip if trunk
    if (data.isTrunk) {
      return skip(`trunk seeds not allowed [${fullVersion}]`);
    }

    // skip if sprint
    if (data.isSprint) {
      return skip(`sprint runs not allowed`);
    }

    // skip if below minimum allowed version
    if ((await compareSemver(MINIMUM_ALLOWED_VERSION, version)) > 0) {
      return skip(`below minimum allowed version [${fullVersion} < ${MINIMUM_ALLOWED_VERSION}]`);
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

      // do NOT wait, this is logging not critical path for request
      GQL_ADD_PARSE_ERROR.run({ errors });

      // throw error with all errors, this will include even non-scrape errors
      // e.g. a real error such as a TypeError will be caught here too
      const error = new Error(`parseMorgue::data.eventErrors`);
      error.extra = data.eventErrors;
      throw error;
    }

    // collect items to send in a single mutation call
    const items = [];

    data.events.forEach((event) => {
      // only allow parseMorgue 'item' `type` (first string arg to createItem)
      if (event.type !== 'item') return;

      // do not record seed items for areas with non-deterministic drops
      // e.g. Abyss, Pandemonium, etc.
      if ({ Abyss: 1, Pandemonium: 1 }[event.branch]) return;

      // creates and associate event.branch if needed
      const branch = {
        data: { name: event.branch },
        on_conflict: { constraint: 'dcsseeds_scrapePlayers_branch_pkey', update_columns: 'name' },
      };

      // creates and associate seed+version if needed
      const seedVersion = {
        data: { seed, version },
        on_conflict: { constraint: 'dcsseeds_scrapePlayers_seedVersion_pkey', update_columns: 'seed' },
      };

      const insertItem = {
        name: event.data.item,
        branch,
        location: event.location,
        morgue: url,
        playerId,
        timestamp: morgue.date,
        seedVersion,
        fullVersion,
      };

      // optionally include event.level
      if (event.level) {
        insertItem.level = parseInt(event.level, 10);
      }

      items.push(insertItem);
    });

    if (items.length) {
      const result = await GQL_ADD_ITEM.run({
        items,
        playerId,
        // remote (server) mark morgue as visited
        data: { [morgue.timestamp]: true },
      });

      return response('done (items)', result);
    }

    return skip('empty');
  } catch (error) {
    // write error into db
    const errors = [{ morgue: morgue.url, error: error.message }];
    GQL_ADD_PARSE_ERROR.run({ errors });

    // bubble error
    return response('error', { message: error.message, extra: error.extra, stack: error.stack });
  }
}

const GQL_ADD_ITEM = serverQuery(
  gql`
    mutation AddItem($playerId: uuid!, $data: jsonb!, $items: [dcsseeds_scrapePlayers_item_insert_input!]!) {
      update_dcsseeds_scrapePlayers(
        _append: { morgues: $data }
        where: { id: { _eq: $playerId } }
        _set: { lastRun: "now()" }
      ) {
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
    mutation AddMorgue($playerId: uuid!, $data: jsonb!) {
      update_dcsseeds_scrapePlayers(
        _append: { morgues: $data }
        where: { id: { _eq: $playerId } }
        _set: { lastRun: "now()" }
      ) {
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

const RE = {
  // https://regexr.com/6ebro
  semver: /(\d+)\.(\d+)(?:\.(\d+))?/,
};

async function compareSemver(semverStringA, semverStringB) {
  const [, ...semverPartsA] = await runRegex('parse-semver-a', semverStringA, RE.semver);
  const [, ...semverPartsB] = await runRegex('parse-semver-b', semverStringB, RE.semver);

  const semverA = semverPartsA.map(toNumber);
  const semverB = semverPartsB.map(toNumber);

  const minPartsToCheck = Math.max(semverA.length, semverB.length);
  for (let i = 0; i < minPartsToCheck; i++) {
    const partA = semverA[i] || 0;
    const partB = semverB[i] || 0;

    if (partA > partB) {
      return +1;
    } else if (partA < partB) {
      return -1;
    }
  }

  return 0;
}
