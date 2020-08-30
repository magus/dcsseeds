// next.config.js

const webpack = require('webpack');
const withSourceMaps = require('@zeit/next-source-maps');

const EnvConfig = require('./src/config/env');

// Forward server environmental variables to client config
const { SENTRY_TOKEN_HEADER } = process.env;

module.exports = withSourceMaps({
  // --------------------------------------------------
  // withSourceMaps: source maps + sentry configuration
  env: {
    // include all non-secret config constants
    ...EnvConfig,

    // include secret .env environmental variables (now env ls)
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
