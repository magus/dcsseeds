const EnvConfig = {
  APP_NAME: 'dcsseeds',
  PROTOCOL: 'https',
  HOSTNAME: 'dcss.now.sh',
  SENTRY_DSN: 'https://c30a968049c246739657687af5d2fabb@o438648.ingest.sentry.io/5403737',
  GOOGLE_ANALYTICS_UA: 'UA-106090287-2',
};

const dev = process.env.NODE_ENV !== 'production';
if (dev) {
  EnvConfig.PROTOCOL = 'http';
  EnvConfig.HOSTNAME = 'localhost:3000';
}

module.exports = EnvConfig;
