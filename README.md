
# dcss-seeds
track random seeds in dcss

# TODO

## prices

include gold price if `event.data.gold` exists (store in gold column with item?)


## better sorting

we need to search for items and order by branch order

the current approach searches seedVersion first which breaks ordering entirely
alternative below is better
  ```graphql
  query {
    dcsseeds_scrapePlayers_item(
      where: { name: { _ilike: "%wyrmbane%" }, branch: { _or: { name: { _eq: "Dungeon" } } } }
      order_by: { branch: { order: asc }, level: asc }
    ) {
      name
      branchName
      level
      seed
      version
    }
  }
  ```

update both useArtifactFilter AND the cache_unrand_query graphql queries

some items are duplicated, this is a problem
items should be unique on (name, branch, level, seed, version)
at some point we were including (morgue, timestamp) which creates duplicates
we may need to restart parsing because there are duplicates that should not be there
  e.g.  https://dcss.vercel.app/?q=%2B13+crystal
        seed  3467139861098030199
        v     0.29.1


## true item search

open ended item search needs more structure, right now it's a very simple text match
but doesn't support using AND/OR to combine clauses, we should come up with a better strategy
for example it'd be much better if we could filter items by
  - type (e.g. shield, axe, staff, body, feet, barding, ring, etc.)
  - brand (e.g. drain, venom, flame, pain, vorpal, vamp, etc.)
  - property (e.g. Slay, Int, Str, rElec, rF, Contam, *Corrode, Drain etc.)
imagine queries such as
  (amulet reflect)       -- amulet with reflect
  (body ac)              -- body armor with any amount of ac
  (head will+ ac+4)      -- head with exactly Will+ and AC+4
  (axe vamp slay>2)      -- axe with at least slay+2 and vamp brand
  (ring !int<0 str>4)    -- ring with at least str+4 and no negative int
  (gold<1000)            -- any item with a cost less then 1000 (including free)

step one will be writing a parser to read items
extract the relevant details into json schema
under `Equip` screen might have started something similar

how can we store these so that we can query these combinations easily?
https://hasura.io/docs/latest/schema/common-patterns/data-modeling/many-to-many/

NOTE: `id` column is for example readability, use `Integer (auto-increment)` in real database
  better performance than `uuid` and we aren't distributed so no need for `uuid`
  > uuids needed when multiple processes generate unique IDs independently
  > https://news.ycombinator.com/item?id=11863492

`property` table, store each property in a row in a table
we can even store unrand as a property and use it to quickly index unrand items
properties would be created on insert and automatically associated
https://hasura.io/docs/latest/schema/common-patterns/data-modeling/many-to-many/#insert-using-many-to-many-relationships

| type     | name                   | id  |
| -------- | ---------------------- | --- |
| unrand   | UNRAND_SPRIGGANS_KNIFE |     |
|          |                        |     |
| weapon   | axe                    |     |
| offhand  | buckler                |     |
| body     | plate armour           |     |
| body     | crystal plate armour   | CPA |
| neck     | scarf                  |     |
| neck     | amulet                 |     |
| ring     | ring                   |     |
|          |                        |     |
| brand    | drain                  |     |
| brand    | vorpal                 |     |
| brand    | vamp                   |     |
|          |                        |     |
| property | gold                   |     |
| property | plus                   | PL  |
| property | slay                   |     |
| property | will                   |     |
| property | rC                     | RC  |
| property | rN                     | RN  |
| property | rPois                  | RPO |
| property | Dex                    | DEX |
| property | AC                     |     |
| property | *Corrode               |     |
|          |                        |     |

`event` table, might look like

| type | id  | name                                                                 | branch  | level | seed                | version | created_at                | updated_at                |
| ---- | --- | -------------------------------------------------------------------- | ------- | ----- | ------------------- | ------- | ------------------------- | ------------------------- |
| item | 42  | +13 crystal plate armour of the Devil's Team {rPois rC+ rN+++ Dex-5} | Dungeon | 4     | 3467139861098030199 | 0.29.1  | 2023-01-14T08:41:56+00:00 | 2023-02-20T16:27:19+00:00 |
|      |     |                                                                      |         |       |                     |         |                           |                           |

`event_property` table, bridges `property` and `event`

| event_id | property_id | value |
| -------- | ----------- | ----- |
| 42       | PL          | 13    |
| 42       | CPA         |       |
| 42       | RPO         | 1     |
| 42       | RC          | 1     |
| 42       | RN          | 3     |
| 42       | DEX         | -5    |
|          |             |       |


iterate + test by parsing and storying a 15 rune win with lots of events, unrands, etc.
then try out queries etc. to ensure things work, if not, blow it away and try again

## show more + result limit
implement a `result_limit`, start at `20`, increment by `20` (`40`, `60`, etc.)
display `[Show more (238 more results)]` button to increase `result_limit`
can either fetch full window each time or select partial window and add to existing


## event search (not just items)

thinking about long term introspection and query flexibility
storing "events" instead of just "items"
think about "events" with a "type" field
we could start by creating a new 'events' table and writing to that at the same time we write
to items when we call scrapePlayers

type: item | unrand | spell | altar | unique | portal
- unrand (known artefacts e.g. wyrmbane, hat of the alchemist, etc.)
- spells (requires magus.rc `note_messages += You add the spell`)
- god altars (e.g. `Found a radiant altar of Vehumet.`)
- uniques
- Portals (eg abyss, ice cave, wizlab, etc)
- acquirement scrolls (see below)

this would give us the ability to easily query for combinations
  e.g. (altar:vehumet) AND (spell:statue form) AND (Dungeon)

there are two approaches we can take to querying, the first is doing it all client-side
just like artifacts we can know the full set of uniques, god altars, spells, portal etc.
since we know them all we could cache and query them just like artifact filters

when we implement true item searching, we can construct an array of conditions for
the where clause in a graphql query and fetch results that way
in order for complex queries to work we need all items to be in a single table

### acquirement scrolls

- instead of parsing `Identified 3 scrolls of acquirement`
- we MUST instead use `Acquired ...` this is because you might identify them anywhere
- which leads to weirdness like this seed, with 3 and 4 acquirements on D1 and D3
- https://dcss.vercel.app/items/0.29.1/9529714651559989746?highlight=3+scrolls+of+acquirement
- D3 4 acquirements https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20230218-042401.txt
- D1 3 acquirements https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20230218-001037.txt
- instead, count each `Acquired ...` event and determine total count
- then save each as a `scroll of Acquirement` on that branch + level
- if there are multiple on a level, count it as multiple
- example https://cbro.berotato.org/morgue/Jingleheimer/morgue-Jingleheimer-20230218-001037.txt
- should show 3 scrolls on D1 and 1 scroll on D3
- each run may reveal them in different levels so we must only ever store a single runs acquirements
- use the run with the greatest total acquirements as the source of truth
- that means we need to compare total acquirements versus current acquirements for seedVersion (query)
- if higher, we must send a delete mutation followed by an insert mutation with the new acquirement events
- MUST do this before writing items since writing items is atomic and also marks morgue as visited/read

### displaying event results

for each event type we should have a toggle to hide/show the options
by default we can have artefacts enabled
e.g. (✅ Artefacts) (❌ Altars) (❌ Uniques) (❌ Portals) (❌ Spells)

by toggling on an event type you opt two things
  1.  showing the filter buttons for that event type
  2.  showing that event type in the result cards
      we can show all items sorted by branch order together and easily turn them on/off


## feedback

- add feedback form page that writes to database
- link to feedback form page on search (small link below search input?)
- allow inputting arbitrary text
- optional contact field that accepts email (validate it client-side)
 - write to database (text, email, created_at)

## self submit pastebin

- allow pasting in literal raw text of a morgue file
- if there is a `value` (seed) then we can parse items and add them
- we don't need to always have a player
- just store a `submission` row and set morgue url to point to an internal link
- e.g. `https://dcss.vercel.app/morgue/:submission_id`
- `submission.id`           guid identifying this unique submission event
- `submission.text`         literal morgue string pasted into input box
- `submission.created_at`   timestamp of submission
- `submission.ip_address`   store so we can find and remove submissions from bad actors if we notice them
- submit `submission` and `items` in one transaction to ensure atomic

## parse morgue visualization

Display a rich page with summary of morgue

Level, title, God etc.

Gods you joined, abandoned and final god you won with

Equipment (tiles for unrands, otherwise tiles for general items)

Skills
Bars with highest skills sorted to top showing relative investment

(can include tile images for uniques)
Slayer of (Uniques killed)
Fled from (Uniques noticed but not killed)

Artefacts
Unrands found (can include tile image)
Randarts found (can include tile image for type)

- Race + Background icons
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/player/base
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/gui/backgrounds

- Design and styling

- Randomize based on % against seed value
  Male vs Female? seed % 2!
  e.g. 8 draconian colors? seed % 8 will select a color for you
  Use this to wear random set of armors for certain backgrounds
  e.g. random robes for casters, random dragon scales for stabbers, random plate/leather/etc for melee classes, etc.


## scrapePlayers

- strategy to make scraping more fair across players
- set a MAX_REQUESTS quota per api request e.g. 250
- for each player (2 requests used of MAX_REQUESTS quota)
  - ensure we are under MAX_REQUESTS quota
  - request rawdata page for list of all morgues
  - parse first morgue file only
  - store rest in a lookup / array
- if we still have leftover requests, proceed ...
  - loop below until we fill our MAX_REQUESTS quota array of request items
  - track total morgues for each loop
  - we can exit when we add no items (all morgues are completed)
  - for each player
    - check if there are morgues to parse
    - remove and add first morgue url

- Icons for item type (e.g. weapons, amulets)
- Unrands can even have their unique images

- Flatten scrapePlayers to single scrapePlayers_items table (merge locations, items, seed, version, fullVersion, etc. in single table)
  items and itemLocations is very similar in size, no need to keep both we are searching locations anyway

- scrapePlayers.morgueLookup column which contains JSON object to quickly mark morgues
  should be able to set keys on the JSON object with mutations (instead of sending entire object)



## seed_players

- api/reparseMorgue
  - other fields? God, Death location, XL, Health, Magic, Gold, AC, EV, etc.

- Query for all unique players to populate two selects on Compare page
  Populate both select elements with the users
  Select the users from the compare url if available
  Use same Compare page component on both compare/index and compare/compareSyntax
  both /compare and compare/playerA..playerB should work fine, the first will select two random players



# Setup

Install `now` CLI

```bash
> yarn global add now
> now login
```

## Commands

Remove unaliased deployments

```sh
yarn server:purge
# now rm retrolink --safe
```

Run local development server from root directory

```sh
yarn dev
open http://localhost:3000
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

Production is deployed automatically when merging to master, alternatively you can manually deploy to production with the command below

```sh
yarn deploy:prod
```

Define a deploy secret

https://zeit.co/docs/v2/environment-variables-and-secrets

```sh
now secrets add <secret-name> <secret-value>
```

# Resources

- [Zeit Dashboard](https://vercel.com/noah/dcsseeds)
- [Google Analytics](https://analytics.google.com/analytics/web/#/a106090287w244212901p227276709/admin)
- [Sentry Issues](https://sentry.io/organizations/dcss/issues/?project=5403737&statsPeriod=14d)
- [Hasura GraphQL database](https://hasura.io/)
- [magic-graphql.iamnoah.com](https://github.com/magus/mono/tree/master/databases/magic-graphql.iamnoah.com) hosted Hasura instance
- [StatusCake](https://app.statuscake.com/); monitor availability and simultaneously keep the Hasura Heroku dyno warm with a periodic query (every 5 min)
