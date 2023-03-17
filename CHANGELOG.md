# CHANGELOG

## 2023-03-16

database backups are not working, the `pg_dump` `curl` returns a 502 status code + error page even after a hard restart

after ssh into the machine noticed terminal felt laggy, fast.com showing slow speeds so many latency related?
tried the commands below and was able to quickly generate a `43MB` `data.sql` so we can manually call `pg_dump` just fine

```sh
❯ dokku config:get hasura HASURA_GRAPHQL_DATABASE_URL
<database_url>
❯ dokku enter hasura
root@459974224faf:/> pg_dump <database_url> --no-owner --no-acl --data-only --schema public -f data.sql
root@459974224faf:/> ls -lsah data.sql
43M -rw-r--r-- 1 root root 43M Mar 17 05:52 data.sql
```

now it's a matter of getting it setup so we can run this `pg_dump` remotely from github actions
one idea is to expose the ports to run `pg_dump` remotely, but maybe we could try ssh and redirect to local machine stdout?


```sh
❯ ssh -T root@104.236.34.97 "dokku run hasura pg_dump postgres://postgres:96b2bda121c09c36d9db62ddf8bad5e3@dokku-postgres-hasura-db:5432/hasura_db --no-owner --no-acl --data-only --schema public" > data.sql
```

works but it's very slow for some reason, but it's a start
worst case scenario we can ssh in, write to file locally (fast) and then upload to aws remotely

in dokku droplet under **Access** clicked **Reset root password** to get root password
to be used to ssh into box from github action

generate a new ssh key for accessing DigitalOcean droplet from github action

```bash
❯ ssh-keygen -t ed25519
Generating public/private ed25519 key pair.
Enter file in which to save the key (/Users/noah/.ssh/id_ed25519): ./magic-auth-github-action
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in ./magic-auth-github-action
Your public key has been saved in ./magic-auth-github-action.pub
❯ cat magic-auth-github-action
```

**Github > Settings > Actions > Secrets**

create **`MAGIC_AUTH_SSH_PRIVATE_KEY`** copying the output from command above
create **`MAGIC_AUTH_SSH_HOST`** secret containing IP of host `104.236.34.97`
create **`MAGIC_AUTH_SSH_USER`** secret containing IP of host `root`
create **`MAGIC_AUTH_DATABASE_URL`** secret containing IP of host `postgres://postgres:P@55w0rd@dokku-postgres-hasura-db:5432/hasura_db`

then adding it to the droplet **"Manually from the Droplet without Password-Based Access"**

https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/to-existing-droplet/#manually

```bash
❯ cat magic-auth-github-action.pub
❯ ssh root@104.236.34.97
root@magic-auth:~# mkdir -p ~/.ssh
root@magic-auth:~# vim ~/.ssh/authorized_keys
# paste in public key on new line
# save and quit
```




## 2023-03-11

need to migrate all previous `NULL` level values to zero
`NULL` is ignored for primary key which causes duplicate rows and cannot be sorted properly by `branch_level` table
first, discover all duplicate rows where  `NULL` in them

```sql
select id from "public"."dcsseeds_scrapePlayers_item" outer_table
where (
    select count(*) from "public"."dcsseeds_scrapePlayers_item" inner_table
    where (
        inner_table.name = outer_table.name
        AND inner_table."branchName" = outer_table."branchName"
        AND inner_table.seed = outer_table.seed
        AND inner_table.morgue = outer_table.morgue
        AND inner_table."fullVersion" = outer_table."fullVersion"
    )
) > 1
```

then run `DELETE` over the select subquery

```sql
DELETE FROM "public"."dcsseeds_scrapePlayers_item" WHERE id IN (
    select id from "public"."dcsseeds_scrapePlayers_item" outer_table
    where (
        select count(*) from "public"."dcsseeds_scrapePlayers_item" inner_table
        where (
            inner_table.name = outer_table.name
            AND inner_table."branchName" = outer_table."branchName"
            AND inner_table.seed = outer_table.seed
            AND inner_table.morgue = outer_table.morgue
            AND inner_table."fullVersion" = outer_table."fullVersion"
        )
    ) > 1
```

finally, now that duplicates are removed we can update all `NULL` values to `0` with mutation below

```graphql
mutation ConvertLevelNullZero {
  update_dcsseeds_scrapePlayers_item(where: {level: {_is_null: true}}, _set: {level: 0}) {
    affected_rows
  }
}
```

## 2023-03-01

- setting up foreign keys to control how updates and deletes impact related tables
  trying to setup so deleting seedVersion will delete associated items

  dcsseeds_scrapePlayers_item . branchName        → dcsseeds_scrapePlayers_branch . name
      update restrict
      delete restrict

  dcsseeds_scrapePlayers_item . ( version, seed ) → dcsseeds_scrapePlayers_seedVersion . ( version, seed )
    update restrict
    delete cascade

- testing on seed with single item first
  v0.29.0, seed 13228964911619526999 (1 item)
  it worked, the associated item is gone
  going to try it again this time with a seed with more items
  v0.29.0, seed 16830254511677329900 (78 items)

  22131 total items before....
  22053 total items after
  22131 - 22053 = 78

- the foreign keys are working as expected


## 2023-02-28

- syntax error near $ when creating postgres function
- look at migrations for actual function sql, the version in admin console has whitespace errors

```sql
CREATE OR REPLACE FUNCTION public."dcsseeds_scrapePlayers_item_search_name"(search_name text)
 RETURNS SETOF "dcsseeds_scrapePlayers_item"
 LANGUAGE sql
 STABLE
AS $function$
    SELECT
      DISTINCT ON ("branch_order", "level", "seed", "version")
      "timestamp",
      "name",
```

## 2023-02-27

### 502 error

- `We're sorry, but something went wrong.` seems to be nginx 502 error page
- https://sourcegraph.com/github.com/dokku/dokku/-/blob/plugins/nginx-vhosts/templates/502-error.html?subtree=true
- this answer seems to have some useful steps for debugging next time
- https://www.digitalocean.com/community/questions/why-am-i-getting-a-502-bad-gateway-using-dokku-after-a-few-hours-of-uptime?comment=152511

- immediate fix was to restart the dokku hasura deploy

    ```sh
    ssh root@104.236.34.97
    dokku tags:deploy hasura
    ```

- using a curl cron to restart instance when it enters this 502 state could be useful as health check
- dokku added crons in 0.23 but we are on 0.22, need to update to unblock dokku crons
- after update above the 502 error reappeared so debugged it a bit but didn't find anything useful
- command logs below

    ```sh
    ssh root@104.236.34.97

    dokku-update
    # this took awhile and also updated system
    # 502 error reappeared after update

    # try to debug a bit
    dokku logs hasura
    # shows failing requests, nothing new learned
    dokku ps:report hasura
    dokku ps:inspect hasura
    # shows process is still running

    curl https://magic-graphql.iamnoah.com/v1/graphql
    # success returns a short json error
    # error returns 502 page

    dokku ps:rebuild --all
    # failed to rebuild hasura, going to try deploying with new git:from-image
    dokku git:from-image hasura hasura/graphql-engine
    dokku ps:rebuild --all
    # still failing, so trying to restart
    dokku ps:restart hasura
        -----> Running post-deploy
        panic: runtime error: index out of range [1] with length 1

        goroutine 1 [running]:
        github.com/dokku/dokku/plugins/common.ParseScaleOutput({0xc0000aa400, 0x0, 0xc0000506e0?})
          /go/src/github.com/dokku/dokku/plugins/common/common.go:399 +0x154
        github.com/dokku/dokku/plugins/network.BuildConfig({0x7ffcaf79d231, 0x6})
          /go/src/github.com/dokku/dokku/plugins/network/network.go:55 +0x116
        main.main()
          /go/src/github.com/dokku/dokku/plugins/network/src/triggers/triggers.go:34 +0x534
        !     exit status 2
    # also fails, same error
    # https://serverfault.com/questions/1123094/after-upgrading-dokku-cant-start-applications
    dokku ps:scale hasura web=1
    # instance successfully restarted now and working
    ```

- can we setup a report policy for dokku hasura app to recover from this failure state?
- updating dokku on DigitalOcean droplet with cron health check
- https://dokku.com/docs/advanced-usage/deployment-tasks/
- https://dokku.com/docs/processes/scheduled-cron-tasks/#using-run-for-cron-tasks


    ```sh
    # can we use dokku checks for health monitoring?
    # we could manually invoke them to see if they restart instance
    # https://dokku.com/docs/deployment/zero-downtime-deploys/#check-instructions
    dokku checks:run hasura
    # runs nothing just waits 10s (default)
    # need to create a CHECKS file in app dir
    dokku apps:report hasura
    # discover app dir /home/dokku/hasura
    cd /home/dokku/hasura
    vim CHECKS

        WAIT=5      # wait 5s before starting checks
        TIMEOUT=30  # timeout after 30s
        ATTEMPTS=5  # retry 5 times

        //magic-graphql.iamnoah.com/v1/graphql {{"{"}}"code":"not-found","error":"resource does not exist","path":"$"{{"}"}}

    # run checks again
    dokku checks:run hasura
    # still defaults, might be in wrong location?
    dokku enter hasura
    # had to be added to dockerfile via below
    vim Dockerfile

        FROM hasura/graphql-engine
        ADD CHECKS /

    docker build -t="dokku/hasura/graphql-engine" .
    dokku git:from-image hasura dokku/hasura/graphql-engine
    # edit dockerfile and retry via
    docker build -t="dokku/hasura/graphql-engine" .
    dokku ps:rebuild hasura
    # checks failing due to variables at top
    # removed variables so just the single check line
    # curl now fails after 5 attempts

        =====> Processing deployment checks
        -----> Deploying hasura via the docker-local scheduler...
        -----> Deploying web (count=1)
              Attempting pre-flight checks (web.1)
              CHECKS expected result: http://localhost/v1/graphql => "{"code":"not-found","error":"resource does not exist","path":"$"}" (web.1)
              Attempt 1/5. Waiting for 5 seconds (web.1)
        !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
        !     Check attempt 1/5 failed (web.1)
              Attempt 2/5. Waiting for 5 seconds (web.1)
        !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
        !     Check attempt 2/5 failed (web.1)
              Attempt 3/5. Waiting for 5 seconds (web.1)
        !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
        !     Check attempt 3/5 failed (web.1)
              Attempt 4/5. Waiting for 5 seconds (web.1)
        !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
        !     Check attempt 4/5 failed (web.1)
              Attempt 5/5. Waiting for 5 seconds (web.1)
        !     curl: (7) Failed to connect to 172.17.0.4 port 5000: Connection refused
        !     Check attempt 5/5 failed (web.1)
        !     Could not start due to 1 failed checks (web.1)

    # trying app.json instead
    # https://dokku.com/docs/advanced-usage/deployment-tasks/
    vim Dockerfile
    vim app.json
    vim health-check.sh
    chmod +x health-check.sh
    docker build -t="dokku/hasura/graphql-engine" .
    dokku ps:rebuild hasura

    # ok the health-check.sh script runs post deploy
    # going to try to setup cron now
    # https://dokku.com/docs/processes/scheduled-cron-tasks/#using-run-for-cron-tasks
    # ok same as above but with the versions checked into magic.iamnoah.com repo
    dokku cron:list hasura
    dokku cron:report hasura

    # cron is running but no logs so setup vector logging
    dokku logs:vector-start
    dokku logs:set hasura vector-sink "console://?encoding[codec]=json"
    dokku logs:vector-logs --tail
    # confirmed cron is running successfully

    # turns out this is useless because the dokku command
    # is not found inside container, so cannot restart in health-check.sh
    # instead will setup a cron inside host machine
    # https://www.digitalocean.com/community/tutorials/how-to-use-cron-to-automate-tasks-ubuntu-1804
    crontab -e
    # paste in line below
    */5 * * * * /home/dokku/hasura/health-check.sh 5 "https://magic-graphql.iamnoah.com/v1/graphql" '{"code":"not-found","error":"resource does not exist","path":"$"}' > /var/log/cronlog 2>&1

    # tail logs for cron, without stdout from process
    journalctl -u cron.service -f
    # confirmed it's running but need to redirect output
    vim /etc/logrotate.d/cronlog

    # since we are no longer modifying dockerfile we can revert the image back to hasura base
    dokku git:from-image hasura hasura/graphql-engine
    dokku ps:rebuild hasura

    # updating instructions in mono/sites/magic.iamnoah.com/README.md
    ```


### query performance
- unrand query for artifact filters was hitting `10s` vercel timeout
- create `/api/cache_unrand_query` to update `window_size` unrand result lists every `1min`
- now `getStaticProps` can query the `unrand_cache` table which is only `106` rows or JSON blobs, very fast
- still bothers me that `/api/cache_unrand_query` for `30` unrands is taking upward for `4000ms`
- finally created a B-Tree index on items table `dcsseeds_scrapeplayers_item_seedVersion(seed, version)`
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
