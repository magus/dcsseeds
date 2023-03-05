import send from 'src/server/zeitSend';

if (!process.env.HASURA_ADMIN_SECRET) throw new Error('HASURA_ADMIN_SECRET is required!');

// runs sql to cleanup event log rows from the database
// periodically we reach the max rows (10,000) supported on heroku
// this frees up space for actual content (e.g. scraped items)
// Example API Request
// http://localhost:3000/api/clean-db

export default async function clean_db(req, res) {
  try {
    // https://hasura.io/docs/latest/graphql/core/api-reference/schema-metadata-api/run-sql/
    const resp = await fetch(process.env.SQL_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({
        type: 'run_sql',
        args: {
          sql: SQL.DeleteCronEventRows,
        },
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf8',
        'X-Hasura-Role': 'admin',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
      },
    });

    const json = await resp.json();
    try {
      return send(res, 200, json.result, { prettyPrint: true });
    } catch (err) {
      return send(res, 200, { json, err }, { prettyPrint: true });
    }
  } catch (err) {
    return send(res, 500, err, { prettyPrint: true });
  }
}

const SQL = {};
SQL.DeleteCronEventRows = `
WITH deleted AS (
  DELETE FROM hdb_catalog.hdb_cron_events
  WHERE
      status IN ('delivered', 'error', 'dead')
      AND created_at < now() - interval '1 day'
  RETURNING status
) SELECT count(*) FROM deleted;
`;

// -- delete rows from table
// DELETE FROM hdb_catalog.hdb_cron_event_invocation_logs;
// DELETE FROM hdb_catalog.hdb_cron_events;

// -- count rows in tables
// SELECT
//   pgClass.relname   AS tableName,
//   pgClass.reltuples AS rowCount
// FROM
//   pg_class pgClass
// INNER JOIN
//   pg_namespace pgNamespace ON (pgNamespace.oid = pgClass.relnamespace)
// WHERE
//   pgNamespace.nspname NOT IN ('pg_catalog', 'information_schema') AND
//   pgClass.relkind='r'
// ORDER BY rowCount DESC
