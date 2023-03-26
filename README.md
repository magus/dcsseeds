[![Test](https://github.com/magus/dcsseeds/actions/workflows/test.yml/badge.svg)](https://github.com/magus/dcsseeds/actions/workflows/test.yml)

# dcss-seeds
track random seeds in dcss

# TODO

## [events-refactor](docs/events-refactor.md)
## [item-search](docs/item-search.md)
## [item-parsing](docs/item-parsing.md)



## ignore items in spots where items should not exist

slime 1-4
hells 1-6

## using crawl to generate full item list

could we use the actual crawl code to generate full item list
stash is a convenient format, output entire itemlist to stash file format?
what about other things such as monsters which might be holding items
god altars, etc.
runtime performance, is it fast? parsing morgue files is very fast, few hundred milliseconds tops
if we did use crawl we might need to find a way to have a built binary that takes in seed/version and spits out the stash file etc?

sourcegraph is good for searching around codebase
> https://sourcegraph.com/search?q=context%3Aglobal+repo%3A%5Egithub%5C.com%2Fcrawl%2Fcrawl%24+register_itemlist&patternType=standard&sm=1&groupBy=path

`debug_item_scan` seems useful as a reference for logging items on a level
> https://sourcegraph.com/github.com/crawl/crawl@b1aff02ba65c83ed325c6641adf377dba14a172d/-/blob/crawl-ref/source/dbg-scan.cc




## alternative graphql nested artifact query approach
### `useArtifactFilter`

with the sorting done above, we should see better results within each result
now the only thing to do will be to sort each of the results by the FIRST item of `item_list`, the filtered items (not all items)
this will put them into the same order as we have from the cached local version

once we have results below we should sort them client side by branch order
add a query for branch order to static props, so we have it client side
use that to sort the top level results and also the items within each result

alternative to nested queries is to build an `_and` query on the items in filter list
all items are grouped and sorted which means we can return first matches for each filter
this means we get perfect branch ordering on the combined results
we should be able to remove a lot of confusing logic around traversing and nesting queries too

this should also be a faster query bringing local and graphql closer in user experience
maybe even good enough to drop the local filtering (but probably not)

```graphql
query {
  dcsseeds_scrapePlayers_seedVersion(
    where: {
      _and: [
        { items: { name: { _ilike: "%amulet of the Four Winds%" } } }
        { items: { name: { _ilike: "%morningstar \"Eos\"%" } } }
      ]
    }
  ) {
    version
    seed
    items(
      order_by: [{ branch_level: { order: asc } }]
      where: {
        _or: [
          { name: { _ilike: "%amulet of Elemental Vulnerability%" } }
          { name: { _ilike: "%amulet of the Air%" } }
          { name: { _ilike: "%amulet of the Four Winds%" } }
          { name: { _ilike: "%amulet of Vitality%" } }
          { name: { _ilike: "%arbalest \"Damnation\"%" } }
          { name: { _ilike: "%arc blade%" } }
          { name: { _ilike: "%autumn katana%" } }
          { name: { _ilike: "%Black Knight's barding%" } }
          { name: { _ilike: "%brooch of Shielding%" } }
          { name: { _ilike: "%captain's cutlass%" } }
          { name: { _ilike: "%Cigotuvi's embrace%" } }
          { name: { _ilike: "%cloak of Starlight%" } }
          { name: { _ilike: "%cloak of the Thief%" } }
          { name: { _ilike: "%crown of Dyrovepreva%" } }
          { name: { _ilike: "%dagger \"Morg\"%" } }
          { name: { _ilike: "%dark maul%" } }
          { name: { _ilike: "%Delatra's gloves%" } }
          { name: { _ilike: "%demon blade \"Leech\"%" } }
          { name: { _ilike: "%demon trident \"Rift\"%" } }
          { name: { _ilike: "%demon whip \"Spellbinder\"%" } }
          { name: { _ilike: "%dragonskin cloak%" } }
          { name: { _ilike: "%dreamshard necklace%" } }
          { name: { _ilike: "%Elemental Staff%" } }
          { name: { _ilike: "%faerie dragon scales%" } }
          { name: { _ilike: "%fencer's gloves%" } }
          { name: { _ilike: "%frozen axe \"Frostbite\"%" } }
          { name: { _ilike: "%gauntlets of War%" } }
          { name: { _ilike: "%giant club \"Skullcrusher\"%" } }
          { name: { _ilike: "%glaive of Prune%" } }
          { name: { _ilike: "%glaive of the Guard%" } }
          { name: { _ilike: "%great mace \"Firestarter\"%" } }
          { name: { _ilike: "%great mace \"Undeadhunter\"%" } }
          { name: { _ilike: "%greatsling \"Punk\"%" } }
          { name: { _ilike: "%hat of Pondering%" } }
          { name: { _ilike: "%hat of the Alchemist%" } }
          { name: { _ilike: "%hat of the Bear Spirit%" } }
          { name: { _ilike: "%heavy crossbow \"Sniper\"%" } }
          { name: { _ilike: "%hood of the Assassin%" } }
          { name: { _ilike: "%Kryia's mail coat%" } }
          { name: { _ilike: "%lajatang of Order%" } }
          { name: { _ilike: "%lance \"Wyrmbane\"%" } }
          { name: { _ilike: "%Lear's hauberk%" } }
          { name: { _ilike: "%lightning scales%" } }
          { name: { _ilike: "%lochaber axe%" } }
          { name: { _ilike: "%longbow \"Zephyr\"%" } }
          { name: { _ilike: "%macabre finger necklace%" } }
          { name: { _ilike: "%mace of Variability%" } }
          { name: { _ilike: "%Mad Mage's Maulers%" } }
          { name: { _ilike: "%Majin-Bo%" } }
          { name: { _ilike: "%mask of the Dragon%" } }
          { name: { _ilike: "%Maxwell's patent armour%" } }
          { name: { _ilike: "%Maxwell's thermic engine%" } }
          { name: { _ilike: "%mithril axe \"Arga\"%" } }
          { name: { _ilike: "%moon troll leather armour%" } }
          { name: { _ilike: "%morningstar \"Eos\"%" } }
          { name: { _ilike: "%mountain boots%" } }
          { name: { _ilike: "%necklace of Bloodlust%" } }
          { name: { _ilike: "%obsidian axe%" } }
          { name: { _ilike: "%orange crystal plate armour%" } }
          { name: { _ilike: "%pair of quick blades \"Gyre\" and \"Gimble\"%" } }
          { name: { _ilike: "%plutonium sword%" } }
          { name: { _ilike: "%ratskin cloak%" } }
          { name: { _ilike: "%ring of Shadows%" } }
          { name: { _ilike: "%ring of the Hare%" } }
          { name: { _ilike: "%ring of the Mage%" } }
          { name: { _ilike: "%ring of the Octopus King%" } }
          { name: { _ilike: "%ring of the Tortoise%" } }
          { name: { _ilike: "%robe of Augmentation%" } }
          { name: { _ilike: "%robe of Clouds%" } }
          { name: { _ilike: "%robe of Folly%" } }
          { name: { _ilike: "%robe of Misfortune%" } }
          { name: { _ilike: "%robe of Night%" } }
          { name: { _ilike: "%robe of Vines%" } }
          { name: { _ilike: "%salamander hide armour%" } }
          { name: { _ilike: "%scales of the Dragon King%" } }
          { name: { _ilike: "%sceptre of Asmodeus%" } }
          { name: { _ilike: "%sceptre of Torment%" } }
          { name: { _ilike: "%scythe \"Finisher\"%" } }
          { name: { _ilike: "%scythe of Curses%" } }
          { name: { _ilike: "%seven-league boots%" } }
          { name: { _ilike: "%shield of Resistance%" } }
          { name: { _ilike: "%shield of the Gong%" } }
          { name: { _ilike: "%shillelagh \"Devastator\"%" } }
          { name: { _ilike: "%Singing Sword%" } }
          { name: { _ilike: "%skin of Zhor%" } }
          { name: { _ilike: "%Spriggan's Knife%" } }
          { name: { _ilike: "%staff of Battle%" } }
          { name: { _ilike: "%staff of Dispater%" } }
          { name: { _ilike: "%staff of Olgreb%" } }
          { name: { _ilike: "%staff of the Meek%" } }
          { name: { _ilike: "%staff of Wucad Mu%" } }
          { name: { _ilike: "%storm bow%" } }
          { name: { _ilike: "%sword of Cerebov%" } }
          { name: { _ilike: "%sword of Power%" } }
          { name: { _ilike: "%sword of Zonguldrok%" } }
          { name: { _ilike: "%Throatcutter%" } }
          { name: { _ilike: "%tower shield of Ignorance%" } }
          { name: { _ilike: "%trident of the Octopus King%" } }
          { name: { _ilike: "%trishula \"Condemnation\"%" } }
          { name: { _ilike: "%Vampire's Tooth%" } }
          { name: { _ilike: "%warlock's mirror%" } }
          { name: { _ilike: "%whip \"Snakebite\"%" } }
          { name: { _ilike: "%woodcutter's axe%" } }
          { name: { _ilike: "%Wrath of Trog%" } }
          { name: { _ilike: "%zealot's sword%" } }
        ]
      }
    ) {
      name
      branchName
      level
    }
  }
}
```


## prices

include gold price in item if  exists
store `event.data.gold` in `item.gold` column for easy display with results

> +7 Spriggan's Knife {stab, EV+4 Stlth+} (1482 gold)


## feedback

- add feedback form page that writes to database
- link to feedback form page on search (small link below search input?)
- allow inputting arbitrary text
- optional contact field that accepts email (validate it client-side)
 - write to database (text, email, created_at)


 ## auto equip

instructions: SHIFT+3 (#) to dump character file
copy link and paste into input
parse lst file and morgue to get current
- floor stash items (lst)
- current equipment (omrgue)
- inventory equipment (morgue)
- player stats (morgue)
- player skills (morgue)

information above can be used to find best equipment to wear
show dropdown for each slot with best item selected
allow changing selection and show relative difference versus suggested/optimal set

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
