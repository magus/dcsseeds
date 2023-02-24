// next.config.js

const webpack = require('webpack');
const withSourceMaps = require('@zeit/next-source-maps');

const EnvConfig = require('./src/config/env');

// Forward server environmental variables to client config
const { SENTRY_TOKEN_HEADER } = process.env;

module.exports = withSourceMaps({
  images: {
    domains: ['raw.githubusercontent.com'],
  },

  // --------------------------------------------------
  // withSourceMaps: source maps + sentry configuration
  env: {
    // include all non-secret config constants
    ...EnvConfig,

    // include secret .env environmental variables (now env ls)
    SENTRY_TOKEN_HEADER,
  },

  // https://securityheaders.com
  async headers() {
    return [
      {
        source: '/',
        headers: securityHeaders,
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  webpack: (config, { isServer, buildId }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(EnvConfig.DEV),
        'process.env.SENTRY_RELEASE': JSON.stringify(buildId),
        'process.env.GRAPHQL_ENDPOINT': JSON.stringify(process.env.GRAPHQL_ENDPOINT),
      }),
    );

    if (!isServer) {
      config.resolve.alias['@sentry/node'] = '@sentry/browser';
    }

    return config;
  },
});

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: `${EnvConfig.PROTOCOL}://${EnvConfig.HOSTNAME}`,
  },
];
