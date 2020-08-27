
# dcss-seeds
track random seeds in dcss

## TODO

- Race + Background icons
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/player/base
  https://github.com/crawl/crawl/tree/master/crawl-ref/source/rltiles/gui/backgrounds

- Design and styling

- Randomize based on % against seed value
  Male vs Female? seed % 2!
  e.g. 8 draconian colors? seed % 8 will select both a color for you
  Use this to wear random set of armors for certain backgrounds
  e.g. random robes for casters, random dragon scales for stabbers, random plate/leather/etc for melee classes, etc.

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
