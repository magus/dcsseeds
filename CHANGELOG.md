# CHANGELOG


## 2023-02-27

- deep in the performance weeds
- unrand query for artifact filters was hitting `10s` vercel timeout
- create `/api/cache_unrand_query` to update `window_size` unrand result lists every `1min`
- now `getStaticProps` can query the `unrand_cache` table which is only `106` rows or JSON blobs, very fast
- still bothers me that `/api/cache_unrand_query` for `30` unrands is taking upward for `4000ms`
- finally created a B-Tree index on items table `dcsseeds_scrapeplayers_item_seedVersionBTREEon(seed, version)`
- this improved query performance significantly since we are looking for all items grouped by seed version
- the original, `106` unrand query is down to `2000ms` from about `10000ms` (`5x` faster)

## 2023-02-16

- realized the unique constraint was not being enforced whatsoever
- looked into creating a custom function to implement `distinct on` + `order by`
- created `dcsseeds_scrapePlayers_items_version_seed` custom function
- used in `src/pages/ItemsSeedVersion/getStaticProps`
- variable names for functions cannot collide with column names otherwise things fail and prefer column name
- e.g. `WHERE seed = seed` is using the same value as the column so equivalent to `WHERE 1=1` (always true)
- so adjusted parameters `seed` -> `input_seed` and `version` -> `input_version`

## 2023-02-15 item constraints

- `dcsseeds_scrapePlayers_item_name_branchName_level_morgue_seed_f` constraint based on `['fullVersion', 'branchName', 'level', 'morgue', 'seed', 'name']` is too unique
- since we incldue `morgue` it creates duplicate items for players who run the same seed
- instead it should be `['version', 'branchName', 'level', 'seed', 'name']` to uniquely identify an item
- in order to implement this constraint i have to cleanup all rows that break the constraint
- if we try to add the constraint hasura admin shows us an error which tells us which items to delete


```json
{ "code": "postgres-error", "error": "query execution failed", "internal": { "arguments": [], "error": { "description": "Key (version, \"branchName\", level, seed, name)=(0.28.0, Dungeon, 9, 10077074884737061911, +0 scale mail of Jipp {Str+2 Dex+3}) is duplicated.", "exec_status": "FatalError", "hint": null, "message": "could not create unique index \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_\"", "status_code": "23505" }, "prepared": false, "statement": "alter table \"public\".\"dcsseeds_scrapePlayers_item\" add constraint \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_key\" unique (\"version\", \"branchName\", \"level\", \"seed\", \"name\");" }, "path": "$[1]" }
```

```json
{
    "code": "postgres-error",
    "error": "query execution failed",
    "internal": {
        "arguments": [],
        "error": {
            "description": "Key (version, \"branchName\", level, seed, name)=(0.28.0, Dungeon, 9, 10077074884737061911, +0 scale mail of Jipp {Str+2 Dex+3}) is duplicated.",
            "exec_status": "FatalError",
            "hint": null,
            "message": "could not create unique index \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_\"",
            "status_code": "23505"
        },
        "prepared": false,
        "statement": "alter table \"public\".\"dcsseeds_scrapePlayers_item\" add constraint \"dcsseeds_scrapePlayers_item_version_branchName_level_seed_name_key\" unique (\"version\", \"branchName\", \"level\", \"seed\", \"name\");"
    },
    "path": "$[1]"
}
```

- hopefully there aren't too many, going to manually start deleting
- finding the duplicates via this graphql query

```
76f5eea9-0c15-4914-9336-1de0dd3f77e1
6c54b091-44ff-448f-8b2a-8121c5da6231
```

```graphql
query MyQuery {
  dcsseeds_scrapePlayers_item(
    where: { name: { _ilike: "+3 leather armour \"Kueloi\" {Fly Int-3 Dex+4 SInv}" } }
    order_by: { timestamp: asc }
  ) {
    id
    name
    morgue
    timestamp
    version
    seed
    branchName
    level
  }
}
```
- deleting the duplicates

```graphql
mutation MyMutation {
  delete_dcsseeds_scrapePlayers_item(
    where: {
      id: {
        _in: [
          "6ee59ef3-6dc7-4053-af31-ad3aab3365a0"
          "445d9fcf-1f06-4ca9-a3f4-ae813169e5ea"
          "f4360bde-07d5-47e8-b5ad-42637cbd03bd"
          "641cc76f-d39b-4947-a781-c420f0f5939a"
          "3a72d4fb-df54-4b9d-9b23-41f3b61c8d23"
          "1e0da1d8-5aec-4343-9d6d-9d4448efa262"
          "8178bcc7-e1f2-414a-a460-1af0842010cc"
          "7a92d8df-2c8e-4165-b0e8-ac393ee2e8f5"
          "b5768699-9ba8-4900-a557-54615e515b20"
        ]
      }
    }
  ) {
    affected_rows
  }
}
```

- there were WAY too many so I opted to delete everything with graphql below

```graphql
mutation MyMutation {
  delete_dcsseeds_scrapePlayers_item(where: {morgue: {_ilike: "http%"}}) {
    affected_rows
  }
}
```

- then immediately saved the new constraint, successfully
- will update scraper and then let it repopulate overnight

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
