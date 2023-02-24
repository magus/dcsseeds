
# dcss-seeds
track random seeds in dcss


# TODO

## cpp parser

- implement `include` in preprocessor by literally copying a files content and putting it inline, then re-run the lexer + preprocessor again until we do not need to edit again

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

## self submit scrape morgue

- setup a form to allow inputting a morgue url
- call api/scrapeMorgue with url=morgue
- if error parsing morgue, show error
- if player doesn't exist return error and direct to form to add player for scraping

## self submit scrape player

- setup a form to allow adding players
- text input for player name
- dropdown with server
- setup an api endpoint that can fetch morgues and confirm player + server combo is valid
- after verifying write entry into scrapePlayers table

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
