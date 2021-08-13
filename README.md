
# dcss-seeds
track random seeds in dcss

# how to update DCSS version

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

## TODO


### parse morgue visualization

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


### scrapePlayers

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


### design

- Race + Background icons
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/player/base
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/gui/backgrounds

- Design and styling

- Randomize based on % against seed value
  Male vs Female? seed % 2!
  e.g. 8 draconian colors? seed % 8 will select a color for you
  Use this to wear random set of armors for certain backgrounds
  e.g. random robes for casters, random dragon scales for stabbers, random plate/leather/etc for melee classes, etc.
### seed_players

- api/reparseMorgue
  - other fields? God, Death location, XL, Health, Magic, Gold, AC, EV, etc.

- Query for all unique players to populate two selects on Compare page
  Populate both select elements with the users
  Select the users from the compare url if available
  Use same Compare page component on both compare/index and compare/compareSyntax
  both /compare and compare/playerA..playerB should work fine, the first will select two random players



## Resources

- [Zeit Dashboard](https://vercel.com/noah/dcsseeds)
- [Google Analytics](https://analytics.google.com/analytics/web/#/a106090287w244212901p227276709/admin)
- [Sentry Issues](https://sentry.io/organizations/dcss/issues/?project=5403737&statsPeriod=14d)

## Setup

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

## server

### Overview

`api` directory contains serverless lambda functions

Hosted on [Zeit](https://zeit.co/docs) running now v2 serverless lamba functions. Handles custom business logic (e.g. [`/src/api/submit`](./src/api/submit.js)).

GraphQL databse backend provided by [Hasura](https://hasura.io/), hosted on [Heroku Postgres](https://www.heroku.com/postgres).

[StatusCake](https://app.statuscake.com/) is used to monitor availability and simultaneously keep the Hasura Heroku dyno warm with a periodic query (every 5 min).

- [parseUser](#parseUser)

## scripts

### parseUser

```sh
yarn search magusnn by Sigmund
```

![Demo GIF of parseUser for user "magusnn" for term "by sigmund"](https://raw.githubusercontent.com/magus/dcsseeds/master/static/parseuser-demo-4x.766b70.gif)
