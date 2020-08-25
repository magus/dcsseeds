// next.config.js

const webpack = require('webpack');
const withSourceMaps = require('@zeit/next-source-maps');

const env = require('./src/config/env');

// Forward server environmental variables to client config
const { SENTRY_TOKEN_HEADER } = process.env;
const { APP_NAME, HOSTNAME, SENTRY_DSN, GOOGLE_ANALYTICS_UA } = env;

module.exports = withSourceMaps({
  // --------------------------------------------------
  // withSourceMaps: source maps + sentry configuration
  env: {
    // non-secret config constants
    APP_NAME,
    HOSTNAME,
    SENTRY_DSN,
    GOOGLE_ANALYTICS_UA,

    // .env environmental variables
    SENTRY_TOKEN_HEADER,
  },

  webpack: (config, { isServer, buildId }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.SENTRY_RELEASE': JSON.stringify(buildId),
      }),
    );

    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }

    return config;
  },
});
