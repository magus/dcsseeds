# CHANGELOG

## 2023-02-05 optimize search performance

- followed documentation for fuzzy text search with hasura

  > https://hasura.io/docs/latest/schema/postgres/custom-functions/#example-fuzzy-match-search-functions
  > https://hasura.io/blog/full-text-search-with-hasura-graphql-api-postgres/

- ran sql below directly, creating index which improved query performance
- query time down to 1s from original 30s (timing out in nextjs static page generation)
- db migrations over in `magus/mono://databases/magic-graphql.iamnoah.com/migrations` are a little funky

  ```sql
  CREATE EXTENSION pg_trgm;

  CREATE INDEX dcsseeds_scrapePlayers_item_name_gin_idx ON "public"."dcsseeds_scrapePlayers_item"
  USING GIN ((name) gin_trgm_ops);
  ```


## 2022-12-23 migrate tables to magic hasura db

- heroku free database is deleted
- recreate all Hasura tables + initial scrape players
- setup `dcsseeds_scrapePlayers` tables in `magic-graphql.iamnoah.com` DB (`magus/mono`)
- updated hasura engine in `magic-auth` droplet

    ```sh
    docker pull hasura/graphql-engine
    docker tag hasura/graphql-engine dokku/hasura
    dokku tags:deploy hasura
    ```


## 2022-08-13 how to update DCSS version

Notes when upgrading from 0.26 to 0.27

- Update versions in `src/utils/Versions.js`
  - (add, remove) any Species and Backgrounds
  - update recommended species/backgrounds lookups
- Add new version to `VERSION_CHOICES` in `src/pages/New/New.js`
- Verify on `/new` route that new version works (errors will throw if recommended things are missing)
- Run `./scripts/getSpells.js` to gather spell list
- Update spell slots in `Slots.rc` in `magus/dcss` .rc file
- Update `src/api/job/scrapePlayers.js` `ALLOWED_VERSIONS` (use `api/pargueMorgue` to determine short `version` value to use here)
- Use delete query at top of `src/api/job/scrapePlayers.js` to reset `scrapePlayers`-related tables
