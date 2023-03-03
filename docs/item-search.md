# item search

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


See [events-refactor](docs/events-refactor.md) which has outline for properties and parsing them out
of item name, this would be requisite for this work so we could create a document for each item



## Algolia

might be worth looking into at least
we might not need it but look into a bit, the free tier seems decent (10k records)
if we upload `seedVersion` with items array it might work out, try uploading one and test it out

> 2722 records
> size = 4 540 486 bytes ~= 4.3 MB
> 4.3 MB / 2722 records ~= 1.7 KB per record

> record with most items, (0.29.1, 17285712271763003931) with 182 items
> size = 38 562 bytes ~= 37.7 KB


```graphql
query ItemRecordDemo {
  dcsseeds_scrapePlayers_seedVersion_aggregate {
    aggregate {
      count(columns: [seed, version])
    }
  }

  dcsseeds_scrapePlayers_seedVersion(limit: 1) {
    seed
    version
    items {
      name
      branch {
        name
        order
      }
      level
    }
  }
}
```

> https://www.algolia.com/doc/

the demo is pretty compelling, very fast, shows facets (pivots for filtering etc.)
if we uploaded items maybe we would get some interesting results and pivots etc.

the React hooks look good too, seems like a very well written library

> https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react-hooks/


### alternatives

#### opensearch
free tier on aws could probably get us far for now
https://opensearch.org/docs
the docs are pretty good, shows some examples like range queries etc which
we would use to implement above
https://opensearch.org/docs/2.4/opensearch/query-dsl/term/#range


#### regex clauses in graphql
translate input into series of regex clauses for query
we can get really close using regex where clauses, see below
only support `>` (not `>=` for simplicity)
  why? `>` and `>=` communicate the same thing
  `plus >  6`  `min_plus = 7 = 6 + 1`
  `plus >= 7`  `min_plus = 7`


```graphql
query {
  dcsseeds_scrapePlayers_item(
    order_by: [{ branch: { order: asc } }, { level: asc }]
    where: {
      _or: [
        # (plus > 6 AND slay > 5) OR (rN > 2 AND Will > 2 AND !Contam)
        {
          _and: [
            # plus > 6 AND slay > 5
            { name: { _iregex: "^\\+([7-9]|\\d{2,})" } }
            { name: { _iregex: "Slay\\+([6-9]|\\d{2,})" } }
            # { name: { _nregex: "\\-Tele" } }
            # brand
            # { name: { _iregex: "{vamp" } }
          ]
        }
        {
          _and: [
            # rN > 2 AND Will > 2 AND !Contam
            { name: { _iregex: "rN[\\+]{3,}" } }
            { name: { _iregex: "Will[\\+]{3,}" } }
            { name: { _nregex: "Contam" } }
            # { name: { _nregex: "\\-Cast" } }
          ]
        }
      ]
    }
  ) {
    version
    seed
    name
    branchName
    level
  }
}
```

#### typesense
https://github.com/dokku/dokku-typesense
https://typesense.org/docs/guide/install-typesense.html#option-1-typesense-cloud


## inspo

### Senry

has a pretty nice search UI, I like how the pills help you build your query

> https://dcss.sentry.io/issues/?project=5403737

> <img src="sentry-search-top.png" width="480" />
> <img src="sentry-search-pill.png" width="480" />
