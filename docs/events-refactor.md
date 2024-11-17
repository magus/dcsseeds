# events refactor

## problems

### duplicates

some items are duplicated, this is not ideal
items should be unique on (name, branch, level, seed, version)
we took a shortcut by putting everything in a single table including (morgue, timestamp)
that means each unique morgue / run for the same seed version creates duplicate entries
e.g. https://dcss.vercel.app/?q=%2B13+crystal
seed 3467139861098030199
v 0.29.1

### clearing morgues, seeds or versions for reparsing

currently `player.morgues` is used to track visited morgues but this is not easily queried
create morgue table and associating morgues with seeds to build morgue map dynamically
allow clearing all seed version items for reparsing etc.

### complex item queries require regex

how can we store these so that we can query these combinations without regex?
https://hasura.io/docs/latest/schema/common-patterns/data-modeling/many-to-many/

**NOTE**: `id` column is for example readability, use `Integer (auto-increment)` in real database
better performance than `uuid` and we aren't distributed so no need for `uuid`

> uuids needed when multiple processes generate unique IDs independently
> https://news.ycombinator.com/item?id=11863492

`dcss_seed_version` table, asssociate unique seed version combinations
Primary Key `id Integer (auto-increment)`
Unique Key `(version, seed)`

- also easy remove / invalidate entries for reparsing
- e.g. delete all rows `WHERE version='0.30.0'`
- ensure when deleting a `seed_version` we should delete all associated `event` and `morgue` entries
- this will cause the players morgue map to remove entries and trigger reparsing those morgue files

| id  | version | seed                |
| --- | ------- | ------------------- |
|     | 0.29.1  | 3467139861098030199 |
|     |         |                     |

`dcss_search_morgue` table, asssociate a specific run to a player
Primary Key `id Integer (auto-increment)`
Unique Key `url`

- allow us to build current `morgues` json map dynamically
- query all rows for a player and then , use `url` to construct the json object for fast lookup in `scrapePlayers`
- instead of timestamp, use the `url` as the key in the map for lookup
- more readable and avoids the timestamp calculation

| id  | timestamp                | version | seed                | url (PK)                                                                     | player_id |
| --- | ------------------------ | ------- | ------------------- | ---------------------------------------------------------------------------- | --------- |
|     | 2023-01-14T08:41:56.000Z | 0.29.1  | 3467139861098030199 | http://crawl.akrasiac.org/rawdata/magusnn/morgue-magusnn-20230114-084156.txt |           |
|     |                          |         |                     |                                                                              |           |

`dcss_search_morgue_event` table, asssociate an event with a specific run from a player (morgue)
Primary Key `id Integer (auto-increment)`
Unique Key `(morgue_id, event_id)`

- allow us see which players found which items and on which runs
- useful for recent run link, which shows the items a player found
- this would look at most recent `morgue` row, then do `event_list_aggregate` with a where clause to count items

| id  | morgue_id | event_id |
| --- | --------- | -------- |
|     |           |          |
|     |           |          |

`dcss_search_event` table, might look like
Primary Key `id Integer (auto-increment)`
Unique Key `(type, name, branch, level, version, seed)`

- `type`, `name`, `branch`, `level`, `version` and `seed` for a unique key to prevent duplicates
- `on_conflict` update `[type, name]` value (basically a noop)
- must store `order` which is the branch order inline as column
  - `order` allows top-level `distinct_on` and `order_by` with `[order, level, seed, version]`
- `branch` is literal name (associated column can be `branch_ref`)
- allows for long term query flexibility
- `type`: artefact | unrand | item | unique | altar | portal | spell
  - artefact (randarts)
  - unrand (known artefacts e.g. wyrmbane, hat of the alchemist, etc.)
    ----------- MVP cut line -----------
  - item (e.g. acquirement scrolls, see below)
  - uniques
  - god altars (e.g. `Found a radiant altar of Vehumet.`)
  - Portals (eg abyss, ice cave, wizlab, etc)
  - spells (requires magus.rc `note_messages += You add the spell`)

| type     | id  | name                                                                 | branch  | order | level | version | seed                 | created_at               | updated_at               |
| -------- | --- | -------------------------------------------------------------------- | ------- | ----- | ----- | ------- | -------------------- | ------------------------ | ------------------------ |
| artefact | 42  | +13 crystal plate armour of the Devil's Team {rPois rC+ rN+++ Dex-5} | Dungeon | -99   | 13    | 0.29.1  | 3467139861098030199  | 2023-01-14T08:41:56.000Z | 2023-02-20T16:27:19.000Z |
| unrand   | 19  | +7 Spriggan's Knife {stab, EV+4 Stlth+}                              | Lair    | -80   | 3     | 0.27.1  | 12712793890262719231 | 2021-11-10T03:15:51.000Z | 2021-11-10T03:15:51.000Z |
|          |     |                                                                      |         |       |       |         |                      |                          |                          |

`dcss_search_property` table, store optional data with event
Primary Key `id Integer (auto-increment)`
Unique Key `(type, name, value)`

- with this flexible property table it becomes clear we could store more information here
  e.g. `unrand` property for marking unique unrand items for indexing and quick lookup
- properties would be created on insert and automatically associated
  https://hasura.io/docs/latest/schema/common-patterns/data-modeling/many-to-many/#insert-using-many-to-many-relationships
- requires parsing properties from item `name` field
  see [item-parsing](./item-parsing.md)

| type     | name                   | value | id   |
| -------- | ---------------------- | ----- | ---- |
| unrand   | UNRAND_SPRIGGANS_KNIFE |       |      |
|          |                        |       |      |
| weapon   | axe                    |       |      |
| weapon   | dagger                 |       |      |
| offhand  | buckler                |       |      |
| body     | plate armour           |       |      |
| body     | crystal plate armour   |       | CPA  |
| neck     | scarf                  |       |      |
| neck     | amulet                 |       |      |
| ring     | ring                   |       |      |
|          |                        |       |      |
| brand    | drain                  |       |      |
| brand    | vorpal                 |       |      |
| brand    | vamp                   |       |      |
|          |                        |       |      |
| property | gold                   |       | GOLD |
| property | plus                   | 7     | 7PL  |
| property | plus                   | 13    | 13PL |
| property | slay                   |       |      |
| property | will                   |       |      |
| property | rC                     | 1     | RC   |
| property | rN                     | 3     | RN   |
| property | rPois                  | 1     | RPO  |
| property | Dex                    | -5    | DEX  |
| property | EV                     | 4     | EV   |
| property | \*Corrode              |       |      |
| property | stab                   |       | STAB |
| property | Stlth                  | 1     | STLT |
|          |                        |       |      |

`dcss_search_event_property` table, bridges `property` and `event`
Primary Key `id Integer (auto-increment)`
Unique Key `(event_id, property_id)`

- many-to-many relationship between `event` and `property`
  this table Object relationship `event: event_id -> event.id`
  this table Object relationship `property: property_id -> property.id`
  `event` table Array relationship `property_list: event_property.event_id -> id`
  `property` table Array relationship `event_list: event_property.property_id -> id`

- `value` column in `event_property` for situations with many possible values (e.g. `gold`)
  e.g. `gold` value is stored in the bridging table to avoid thousands of `property` rows

| event_id | property_id | value |
| -------- | ----------- | ----- |
| 42       | 13PL        |       |
| 42       | CPA         |       |
| 42       | RPO         |       |
| 42       | RC          |       |
| 42       | RN          |       |
| 42       | DEX         |       |
| 42       | GOLD        | 1862  |
|          |             |       |
| 19       | 7PL         |       |
| 19       | STAB        |       |
| 19       | EV          |       |
| 19       | STLT        |       |
|          |             |       |

iterate + test by parsing and storying a 15 rune win with lots of events, unrands, etc.
then try out queries etc. to ensure things work, if not, blow it away and try again

setup a parallel events scraper that runs every 5 minutes like items
allow us to test and gather events without breaking existing items functionality

## event search (not just items)

`event` `type` and `property` above give us the ability to easily query for combinations

we can construct an array of conditions for
the where clause in a graphql query and fetch results ad-hoc for each query

> events matching any of 3 different conditions, ordered by branch and level

```graphql
query {
  dcss_search_event(
    order_by: [{ order: asc }, { level: asc }]
    where: {
      _or: [
        # (plus>4 OR brand=vamp) OR (rC>=1 rF>=1)
        {
          _or: [
            # plus>4 OR brand=vamp
            { property_list: { property: { name: { _eq: "plus" }, value: { _gt: 4 } } } }
            { property_list: { property: { type: { _eq: "brand" }, name: { _eq: "vamp" } } } }
          ]
        }
        {
          _and: [
            # rC>=1 rF>=1 (rC>=1 AND rF>=1)
            { property_list: { property: { name: { _eq: "rC" }, value: { _gte: 1 } } } }
            { property_list: { property: { name: { _eq: "rF" }, value: { _gte: 1 } } } }
          ]
        }
      ]
    }
  ) {
    version
    seed
    name
    branch
    level
  }
}
```

### displaying event results

on `/items/[version]/[seed]` display 3 columns to clearly distinguish between event types
because events are stored in the same table we can order them by branch showing them collated together in branch order

maybe color code the rows slightly

- items (orange)
- altars (white/yellow)
- uniques (red), etc.

| location  | type     | name                                    |
| --------- | -------- | --------------------------------------- |
| Dungeon 1 | altar    | Vehumet                                 |
| Dungeon 4 | artefact | +3 robe of Wisdom {Int+5}               |
| Orc 1     | item     | scroll of acquirement                   |
| Lair 3    | unrand   | +7 Spriggan's Knife {stab, EV+4 Stlth+} |
|           |          |                                         |

for each event type we should have a toggle to hide/show the options
by default we can have artefacts enabled
e.g. (✅ Artefacts) (❌ Altars) (❌ Uniques) (❌ Portals) (❌ Spells)

by toggling on an event type you opt into a few things

1. showing the full list of filter buttons for that event type
2. showing that event type in the result cards
3. showing that event type on item pages (above)

## acquirement scrolls

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

## combining item search, filters and other event types

currently item search and artefact search are separate
this is ideal because it keeps things focused and simple

there are two approaches we can take to querying

1.  fully client-side, just like artifacts we can know the full set
    of uniques, god altars, spells, portal etc.
    since we know them all we could cache and query them just like artifact filters

2.  graphql request on each query, downside is this is slower

3.  collate results from item search with filter searches (messy/confusing)
