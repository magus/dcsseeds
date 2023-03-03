// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const EnvConfig = require('./src/config/env');

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://c30a968049c246739657687af5d2fabb@o438648.ingest.sentry.io/5403737',
  // Adjust this value in production, or use tracesSampler for greater control
  // approx 300 transactions per hour
  // 300 * 24 * 30 = 216 000 transactions per month
  // 10 000 / 216 000 ~= 0.05 sample rate
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/sampling/
  // https://dcss.sentry.io/stats/?dataCategory=transactions&pageEnd=2023-03-24&pageStart=2023-02-25&pageUtc=true&project=5403737&utc=true
  sampleRate: 1.0,
  tracesSampleRate: 0.05,

  // enable in prod only
  // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#enabled
  enabled: !EnvConfig.DEV,
  debug: false,

  // ...

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
