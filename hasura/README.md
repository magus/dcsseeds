# hasura

## Hasura Console

To interact with the database use the Hasura Console

```
> export HASURA_GRAPHQL_ADMIN_SECRET=<secret>
> hasura console
```

**Note**: Added `export HASURA_GRAPHQL_ADMIN_SECRET` to `~/.private` which is private but automatically loaded by my [dotfiles setup](https://github.com/magus/dotfiles/blob/master/zsh/zshrc.symlink#L39).

## Setup Hasura CLI

[Hasura CLI](https://hasura.io/docs/1.0/graphql/manual/hasura-cli/install-hasura-cli.html) provides access to the hasura console and automatically creates migrations to track changes to your overall database schema (See: [Migrations & Metadata](https://hasura.io/docs/1.0/graphql/manual/migrations/index.html)).

At the time of writing Hasura was already setup so we followed [Migrations for an existing database and Hasura instance](https://hasura.io/docs/1.0/graphql/manual/migrations/existing-database.html).

### `create.sql`

_**IMPORTANT**_: Remember to **DISABLE** `pgdump` after generating `create.sql`

`create.sql` contains SQL statements which can be used to generate the PostgreSQL database. Steps below outline how to generate the `create.sql` from a Hasura instance running in Heroku.

- Navigate to the [Heroku Retrolink Dashboard > Settings](https://dashboard.heroku.com/apps/retrolink-hasura/settings)
- Click on `Reveal Config Vars`
- Append `pgdump` to the list of enabled APIs (`HASURA_GRAPHQL_ENABLED_APIS`)

```sh
HASURA_SECRET=password
curl -X POST -H "Content-Type: application/json" -d '{"opts": ["-O", "-x", "--schema-only", "--schema", "public"], "clean_output": true}' -H "x-hasura-admin-secret: $HASURA_SECRET" https://retrolink-hasura.herokuapp.com/v1alpha1/pg_dump > $(git rev-parse --show-toplevel)/hasura/create.sql
```

## metadata.json

Snapshot of the metadata representing the database on Hasura backend. Exported from [Hasura > Settings > Metadata Actions](https://retrolink-hasura.herokuapp.com/console/settings/).

Read more at [Managing Hasura metadata](https://docs.hasura.io/1.0/graphql/manual/migrations/manage-metadata.html).

## Resources

- [Heroku](https://dashboard.heroku.com/apps/retrolink-hasura)
- [Migrations & Metadata](https://hasura.io/docs/1.0/graphql/manual/migrations/index.html))
- [Hasura CLI](https://hasura.io/docs/1.0/graphql/manual/hasura-cli/install-hasura-cli.html)
- [PG Dump API](https://docs.hasura.io/1.0/graphql/manual/api-reference/pgdump.html)
